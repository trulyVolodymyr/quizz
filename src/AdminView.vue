<template>
  <div class="h-screen flex flex-col bg-slate-100 overflow-hidden">

    <header class="bg-[#4b05ff] text-white px-6 py-4 shadow-lg">
      <div class="max-w-5xl mx-auto flex items-center justify-between">
        <div>
          <h1 class="text-xl font-bold">Результати оцінювань</h1>
          <p class="text-blue-200 text-sm mt-0.5">Адмін-панель</p>
        </div>
        <button
          class="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/40 text-white text-sm font-medium hover:bg-white/10 transition-colors"
          @click="$emit('back')"
        >
          <i class="pi pi-arrow-left text-xs" />
          Назад
        </button>
      </div>
    </header>

    <main class="flex-1 px-4 py-6 overflow-hidden">
      <div class="max-w-5xl mx-auto h-full flex flex-col">

        <div v-if="loading" class="flex justify-center py-20">
          <i class="pi pi-spin pi-spinner text-3xl text-[#4b05ff]" />
        </div>

        <div v-else-if="evaluatedPersons.length === 0" class="text-center py-20 text-gray-400">
          Результатів ще немає
        </div>

        <template v-else>
          <!-- Tabs -->
          <div class="flex flex-wrap gap-2 mb-6">
            <button
              v-for="person in evaluatedPersons"
              :key="person.id"
              class="px-4 py-2 rounded-xl text-sm font-semibold transition-colors"
              :class="activePersonId === person.id
                ? 'bg-[#4b05ff] text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-50 shadow-sm'"
              @click="activePersonId = person.id"
            >
              {{ person.name }}
              <span class="ml-1.5 text-xs opacity-60">({{ countFor(person.id) }})</span>
            </button>
          </div>

          <!-- Evaluator legend -->
          <div v-if="activeResults.length" class="bg-white rounded-2xl shadow-sm px-6 py-3 mb-3 flex flex-wrap gap-5">
            <div
              v-for="(r, idx) in activeResults"
              :key="r.id"
              class="flex items-center gap-2 text-sm font-medium text-gray-600"
            >
              <span class="w-3 h-3 rounded-full" :style="{ background: COLORS[idx % COLORS.length] }" />
              {{ r.evaluator_person.name }}
            </div>
          </div>

          <div class="flex-1 min-h-0">
            <!-- Bars chart -->
            <div v-if="activeResults.length" class="bg-white rounded-2xl shadow-md overflow-y-auto h-full">
              <div
                v-for="(q, i) in questions"
                :key="q.id"
                class="flex items-center gap-4 px-6 py-4 border-b border-gray-50 last:border-0 hover:bg-slate-50/50 transition-colors"
              >
                <!-- Question label -->
                <div class="w-48 shrink-0">
                  <div class="text-sm font-bold text-gray-800 leading-tight">{{ q.title }}</div>
                  <div v-if="q.subtitle" class="text-xs text-gray-400 mt-0.5">{{ q.subtitle }}</div>
                </div>

                <!-- Bars + score + name -->
                <div class="flex-1 flex flex-col gap-2 min-w-0">
                  <div
                    v-for="(r, idx) in activeResults"
                    :key="r.id"
                    class="flex items-center gap-3 min-w-0"
                  >
                    <div class="flex-1 h-2.5 bg-gray-100 rounded-full overflow-hidden">
                      <div
                        class="h-full rounded-full transition-all duration-700 ease-out"
                        :style="{
                          width: barWidth(scoreFor(r, q.id), q) + '%',
                          backgroundColor: COLORS[idx % COLORS.length],
                          opacity: 0.85,
                        }"
                      />
                    </div>

                    <div
                      class="text-sm font-extrabold leading-tight w-16 text-right"
                      :style="{ color: COLORS[idx % COLORS.length] }"
                    >
                      {{ scoreFor(r, q.id) ?? '—' }}
                      <span class="text-[10px] font-semibold text-gray-300">/ {{ q.max }}</span>
                    </div>

                    <div class="text-xs sm:text-sm font-medium text-gray-600 w-24 sm:w-32 truncate">
                      {{ r.evaluator_person.name }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div v-else class="h-full flex items-center justify-center text-gray-400 text-sm">
              Для цього співробітника ще немає оцінювань
            </div>
          </div>
        </template>

      </div>
    </main>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue'
import { supabase } from './supabase.js'
import { questions } from './questions.js'

defineEmits(['back'])

const COLORS = ['#4b05ff', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4', '#f97316']

const loading = ref(true)
const results = ref([])
const activePersonId = ref(null)

const evaluatedPersons = computed(() => {
  const map = new Map()
  for (const r of results.value) {
    if (!map.has(r.evaluated_person.id)) map.set(r.evaluated_person.id, r.evaluated_person)
  }
  return [...map.values()]
})

const activeResults = computed(() =>
  results.value.filter(r => r.evaluated_person.id === activePersonId.value)
)

function countFor(personId) {
  return results.value.filter(r => r.evaluated_person.id === personId).length
}

function scoreFor(result, questionId) {
  const a = result.answers.find(a => a.question_id === questionId)
  return a?.score ?? null
}

function barWidth(score, question) {
  if (score === null || score === undefined || question.max <= 0) return 0
  return Math.max(0, Math.min(100, (score / question.max) * 100))
}

onMounted(async () => {
  const { data, error } = await supabase
    .from('quiz_results')
    .select(`
      id, answers, created_at,
      evaluated_person:persons!evaluated_person_id(id, name),
      evaluator_person:persons!evaluator_person_id(id, name)
    `)
    .order('created_at', { ascending: false })

  loading.value = false
  if (error) { console.error(error); return }
  results.value = data

  if (evaluatedPersons.value.length > 0) {
    activePersonId.value = evaluatedPersons.value[0].id
  }
})
</script>

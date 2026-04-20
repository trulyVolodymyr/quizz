<template>
  <div class="min-h-screen bg-slate-100 font-sans">

    <!-- ── ADMIN VIEW ── -->
    <AdminView v-if="showAdmin" @back="showAdmin = false" />

    <template v-else>
    <!-- ── LOADING ── -->
    <div v-if="loading" class="min-h-screen flex items-center justify-center">
      <div class="text-center">
        <i class="pi pi-spin pi-spinner text-3xl text-[#4b05ff]" />
        <p class="mt-3 text-sm text-gray-500">Завантаження…</p>
      </div>
    </div>

    <!-- ── LOGIN VIEW ── -->
    <div v-else-if="!user" class="min-h-screen flex items-center justify-center px-4">
      <div class="bg-white rounded-2xl shadow-md overflow-hidden w-full max-w-md">
        <div class="bg-[#4b05ff] text-white px-6 py-8 text-center">
          <h1 class="text-2xl font-bold">Оцінка компетенцій</h1>
          <p class="text-blue-200 text-sm mt-2">Увійдіть, щоб розпочати</p>
        </div>
        <div class="px-6 py-8 flex flex-col items-center gap-4">
          <p v-if="authError" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2 w-full text-center">
            {{ authError }}
          </p>
          <button
            class="w-full flex items-center justify-center gap-3 px-6 py-3 rounded-xl border-2 border-gray-200 font-semibold text-sm text-gray-700 hover:border-[#4b05ff] hover:text-[#4b05ff] transition-colors"
            @click="loginWithGoogle"
          >
            <svg class="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Увійти через Google
          </button>
        </div>
      </div>
    </div>

    <!-- ── PERSON SELECT VIEW ── -->
    <div v-else-if="!evaluatedPerson" class="min-h-screen flex items-center justify-center px-4">
      <div class="bg-white rounded-2xl shadow-md overflow-hidden w-full max-w-md">
        <div class="bg-[#4b05ff] text-white px-6 py-6">
          <div class="flex items-center justify-between">
            <div>
              <h1 class="text-xl font-bold">Оцінка компетенцій</h1>
              <p class="text-blue-200 text-sm mt-1">Налаштуйте оцінювання</p>
            </div>
            <button
              class="text-blue-300 hover:text-white text-xs underline transition-colors"
              @click="logout"
            >
              Вийти
            </button>
          </div>
          <p class="mt-3 text-xs text-blue-300 bg-white/10 rounded-lg px-3 py-1.5">
            {{ user.email }}
          </p>
        </div>
        <div class="px-6 py-6 flex flex-col gap-5">
          <p v-if="personError" class="text-sm text-red-600 bg-red-50 border border-red-200 rounded-xl px-4 py-2">
            {{ personError }}
          </p>

          <!-- Select 1: who am I -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Хто я?</label>
            <p class="text-xs text-gray-400 mb-2">Оберіть один раз — буде збережено до вашого акаунту</p>
            <select
              v-model="pendingMyPerson"
              :disabled="loadingPersons || myPersonLocked"
              class="w-full border-2 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none transition-colors appearance-none"
              :class="myPersonLocked
                ? 'border-gray-100 bg-gray-50 text-gray-500 cursor-not-allowed'
                : 'border-gray-200 bg-white focus:border-[#4b05ff]'"
            >
              <option :value="null" disabled>
                {{ loadingPersons ? 'Завантаження…' : '— Оберіть зі списку —' }}
              </option>
              <option v-for="p in identityPersons" :key="p.id" :value="p">{{ p.name }}</option>
            </select>
            <p v-if="myPersonLocked" class="mt-1.5 text-xs text-green-600 flex items-center gap-1">
              <i class="pi pi-lock text-xs" /> Збережено
            </p>
          </div>

          <!-- Select 2: who am I evaluating -->
          <div>
            <label class="block text-sm font-semibold text-gray-700 mb-1">Кого оцінюю?</label>
            <p class="text-xs text-gray-400 mb-2">Обирайте щоразу перед початком оцінювання</p>
            <select
              v-model="pendingEvaluatedPerson"
              :disabled="loadingPersons || !pendingMyPerson"
              class="w-full border-2 border-gray-200 rounded-xl px-4 py-3 text-sm font-medium text-gray-700 focus:outline-none focus:border-[#4b05ff] transition-colors appearance-none bg-white disabled:opacity-50"
            >
              <option :value="null" disabled>
                {{ loadingPersons ? 'Завантаження…' : '— Оберіть зі списку —' }}
              </option>
              <option
                v-for="p in allowedEvaluationPersons"
                :key="p.id"
                :value="p"
                :disabled="alreadyEvaluated.includes(p.id)"
              >{{ p.name }}{{ alreadyEvaluated.includes(p.id) ? ' — вже оцінено' : '' }}</option>
            </select>
          </div>

          <button
            :disabled="!canStart || claimingPerson"
            class="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl font-semibold text-sm transition-colors"
            :class="canStart && !claimingPerson
              ? 'bg-[#4b05ff] text-white hover:bg-[#3a04cc]'
              : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
            @click="claimAndStart"
          >
            <i v-if="claimingPerson" class="pi pi-spin pi-spinner text-xs" />
            <template v-else>
              Розпочати оцінювання
              <i class="pi pi-arrow-right text-xs" />
            </template>
          </button>

          <button
            v-if="isAdmin"
            class="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl border-2 border-[#4b05ff] text-[#4b05ff] font-semibold text-sm hover:bg-[#4b05ff] hover:text-white transition-colors"
            @click="showAdmin = true"
          >
            <i class="pi pi-chart-bar text-xs" />
            Переглянути результати
          </button>
        </div>
      </div>
    </div>

    <!-- ── QUIZ VIEW ── -->
    <div v-else-if="evaluatedPerson && !showResults" class="min-h-screen flex flex-col">

      <!-- Header -->
      <header class="bg-[#4b05ff] text-white px-6 py-4 shadow-lg sticky top-0 z-10">
        <div class="max-w-3xl mx-auto">
          <div class="flex items-center justify-between mb-2">
            <div>
              <h1 class="text-base font-bold tracking-wide uppercase opacity-80">Оцінка компетенцій</h1>
              <p class="text-xs text-blue-300 mt-0.5">{{ evaluatedPerson.name }}</p>
            </div>
            <span class="text-sm font-semibold bg-white/10 px-3 py-1 rounded-full">
              {{ currentIndex + 1 }} / {{ questions.length }}
            </span>
          </div>
          <div class="w-full bg-white/20 rounded-full h-1.5">
            <div
              class="bg-white h-1.5 rounded-full transition-all duration-500 ease-out"
              :style="{ width: `${progress}%` }"
            />
          </div>
        </div>
      </header>

      <!-- Main -->
      <main class="flex-1 px-4 py-6 flex justify-center">
        <div class="w-full max-w-3xl flex flex-col gap-4">

          <!-- Card -->
          <Transition name="slide" mode="out-in" @after-enter="focusInput">
            <div :key="current.id" class="bg-white rounded-2xl shadow-md overflow-hidden">

              <!-- Card title -->
              <div class="bg-[#4b05ff] text-white px-6 py-5">
                <h2 class="text-xl font-bold leading-tight">{{ current.title }}</h2>
                <p v-if="current.subtitle" class="mt-1 text-sm font-medium text-blue-200">
                  {{ current.subtitle }}
                </p>
                <p class="mt-3 text-xs text-blue-300 uppercase tracking-wider">
                  Діапазон: від {{ current.min }} до {{ current.max }}
                </p>
              </div>

              <!-- Scale reference -->
              <div class="px-6 pt-5 pb-2">
                <p class="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">
                  Шкала оцінювання
                </p>
                <div class="space-y-2">
                  <div
                    v-for="answer in current.answers"
                    :key="answer.display"
                    class="flex align-top gap-3 px-3 py-2.5 rounded-xl border-l-4 transition-all duration-200"
                    :class="isHighlighted(answer)
                      ? 'bg-blue-50 border-[#4b05ff]'
                      : 'bg-gray-50 border-transparent'"
                  >
                    <p
                      class="text-sm font-extrabold"
                      :class="isHighlighted(answer) ? 'text-[#4b05ff]' : 'text-gray-400'"
                    >
                      {{ answer.display }}
                    </p>
                    <p
                      class="text-sm leading-relaxed"
                      :class="isHighlighted(answer) ? 'text-gray-900 font-medium' : 'text-gray-500'"
                    >
                      {{ answer.text }}
                    </p>
                  </div>
                </div>
              </div>

              <!-- Input row -->
              <div class="px-6 py-5 mt-2 border-t border-gray-100 bg-gray-50/70">
                <label class="block text-sm font-semibold text-gray-700 mb-3">
                  Введіть оцінку
                </label>
                <div class="flex flex-wrap items-start gap-4" @keydown.enter.prevent="handleEnter">
                  <InputNumber
                    ref="inputRef"
                    v-model="currentAnswer"
                    :min="current.min"
                    :max="current.max"
                    :show-buttons="true"
                    button-layout="horizontal"
                    :step="1"
                    decrement-button-class="p-button-secondary text-white"
                    increment-button-class="p-button-secondary text-white"
                    decrement-button-icon="pi pi-minus"
                    increment-button-icon="pi pi-plus"
                    input-style="width:5rem;text-align:center;font-size:1.25rem;font-weight:700;color:#4b05ff"
                  />
                  <Transition name="fade">
                    <div
                      v-if="highlightedLevel"
                      class="flex-1 min-w-0 text-sm text-[#4b05ff] bg-blue-50 border border-blue-100 rounded-xl px-4 py-2.5"
                    >
                      <span class="font-bold">Рівень {{ currentAnswer }}:</span>
                      {{ highlightedLevel.text }}
                    </div>
                  </Transition>
                </div>
              </div>
            </div>
          </Transition>

          <!-- Navigation -->
          <div class="flex justify-between items-center">
            <button
              v-if="currentIndex > 0"
              class="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-[#4b05ff] text-[#4b05ff] font-semibold text-sm hover:bg-[#4b05ff] hover:text-white transition-colors"
              @click="prev"
            >
              <i class="pi pi-arrow-left text-xs" />
              Назад
            </button>
            <div v-else />

            <button
              v-if="currentIndex < questions.length - 1"
              :disabled="!isAnswered"
              class="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
              :class="isAnswered
                ? 'bg-[#4b05ff] text-white hover:bg-[#254d7a]'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
              @click="next"
            >
              Далі
              <i class="pi pi-arrow-right text-xs" />
            </button>
            <button
              v-else
              :disabled="!isAnswered"
              class="flex items-center gap-2 px-6 py-2.5 rounded-xl font-semibold text-sm transition-colors"
              :class="isAnswered
                ? 'bg-green-600 text-white hover:bg-green-700'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'"
              @click="finish"
            >
              <i class="pi pi-check text-xs" />
              Завершити
            </button>
          </div>

        </div>
      </main>
    </div>

    <!-- ── RESULTS VIEW ── -->
    <div v-else class="min-h-screen flex flex-col">

      <header class="bg-[#4b05ff] text-white px-6 py-5 shadow-lg">
        <div class="max-w-5xl mx-auto flex items-center justify-between">
          <div>
            <h1 class="text-xl font-bold">Результати оцінки</h1>
            <p class="text-blue-200 text-sm mt-0.5">{{ evaluatedPerson?.name }} · {{ questions.length }} компетенцій</p>
          </div>
          <div class="flex gap-3">
            <button
              v-if="isAdmin"
              class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
              @click="showAdmin = true"
            >
              <i class="pi pi-chart-bar text-xs" />
              Всі результати
            </button>
            <button
              class="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/40 text-white text-sm font-medium hover:bg-white/10 transition-colors"
              @click="printResults"
            >
              <i class="pi pi-print text-xs" />
              Друк
            </button>
            <button
              class="flex items-center gap-2 px-4 py-2 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-colors"
              @click="newEvaluation"
            >
              <i class="pi pi-refresh text-xs" />
              Нове оцінювання
            </button>
            <button
              class="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/40 text-white text-sm font-medium hover:bg-white/10 transition-colors"
              @click="logout"
            >
              <i class="pi pi-sign-out text-xs" />
              Вийти
            </button>
          </div>
        </div>
      </header>

      <main class="flex-1 px-4 py-6">
        <div class="max-w-5xl mx-auto">
          <div class="bg-white rounded-2xl shadow-md overflow-hidden">
            <table class="w-full border-collapse">
              <thead>
                <tr class="bg-[#4b05ff] text-white text-sm">
                  <th class="px-4 py-3 text-left font-semibold">#</th>
                  <th class="px-4 py-3 text-left font-semibold">Компетенція</th>
                  <th class="px-4 py-3 text-left font-semibold hidden sm:table-cell">Підшкала</th>
                  <th class="px-4 py-3 text-center font-semibold w-24">Оцінка</th>
                  <th class="px-4 py-3 text-left font-semibold">Рівень</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="(q, i) in questions"
                  :key="q.id"
                  class="border-b border-gray-100 hover:bg-slate-50 transition-colors"
                >
                  <td class="px-4 py-3 text-xs text-gray-400 font-mono">{{ i + 1 }}</td>
                  <td class="px-4 py-3">
                    <span class="text-sm font-semibold text-[#4b05ff]">{{ q.title }}</span>
                  </td>
                  <td class="px-4 py-3 hidden sm:table-cell">
                    <span class="text-sm text-gray-400">{{ q.subtitle || '—' }}</span>
                  </td>
                  <td class="px-4 py-3 text-center">
                    <span
                      class="inline-flex items-center justify-center w-9 h-9 rounded-full text-sm font-bold"
                      :class="scoreColor(answers[i])"
                    >
                      {{ answers[i] }}
                    </span>
                  </td>
                  <td class="px-4 py-3">
                    <template v-if="getLevelForValue(q, answers[i])">
                      <span class="text-xs font-bold text-[#4b05ff] mr-1">
                        {{ getLevelForValue(q, answers[i]).display }}:
                      </span>
                      <span class="text-xs text-gray-600">
                        {{ truncate(getLevelForValue(q, answers[i]).text, 110) }}
                      </span>
                    </template>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>

    </template><!-- end v-else (not admin) -->
  </div>
</template>

<script setup>
import { ref, computed, watch, nextTick, onMounted } from 'vue'
import { questions } from './questions.js'
import { supabase } from './supabase.js'
import AdminView from './AdminView.vue'

// ── Auth ──
const user = ref(null)
const loading = ref(true)
const authError = ref(null)

// ── Persons ──
const allPersons = ref([])
const loadingPersons = ref(false)
const personError = ref(null)

// Select 1: who am I (locked after first save)
const myPerson = ref(null)       // saved in DB
const myPersonLocked = ref(false)
const pendingMyPerson = ref(null)

// Select 2: who am I evaluating (always free)
const pendingEvaluatedPerson = ref(null)
const evaluatedPerson = ref(null)

const claimingPerson = ref(false)
const showAdmin = ref(false)
const alreadyEvaluated = ref([]) // evaluated_person_ids already submitted by this user

const isAdmin = computed(() => [1, 6, 7].includes(myPerson.value?.id))

// Who this user is allowed to evaluate based on their person id
const FULL_ACCESS = [1, 5, 6, 7]   // can evaluate everyone
const LIMITED_CAN_EVAL = [1, 5]     // persons 2,3,4 can only eval these + themselves

const allowedEvaluationPersons = computed(() => {
  const myId = pendingMyPerson.value?.id
  if (!myId) return []
  if (FULL_ACCESS.includes(myId)) return allPersons.value
  return allPersons.value.filter(p => LIMITED_CAN_EVAL.includes(p.id) || p.id === myId)
})

// Only unclaimed + my own person for identity select
const identityPersons = computed(() =>
  allPersons.value.filter(p => !p.is_verified || p.user_id === user.value?.id)
)

const canStart = computed(() =>
  pendingMyPerson.value !== null && pendingEvaluatedPerson.value !== null
)

// ── Quiz ──
const inputRef = ref(null)
const QUIZ_DRAFT_STORAGE_KEY = 'quiz:draft:v1'
const isRestoringDraft = ref(false)

function getDraftStorageKey() {
  if (!user.value?.id) return null
  return `${QUIZ_DRAFT_STORAGE_KEY}:${user.value.id}`
}

function clearQuizDraft() {
  const key = getDraftStorageKey()
  if (key) localStorage.removeItem(key)
}

function saveQuizDraft() {
  if (isRestoringDraft.value || !evaluatedPerson.value || showResults.value) return

  const key = getDraftStorageKey()
  if (!key) return

  const safeAnswers = Array.from({ length: questions.length }, (_, i) => {
    const val = answers.value[i]
    return typeof val === 'number' ? val : null
  })

  const draft = {
    evaluatedPersonId: evaluatedPerson.value.id,
    answers: safeAnswers,
    currentIndex: Math.max(0, Math.min(questions.length - 1, currentIndex.value)),
  }

  localStorage.setItem(key, JSON.stringify(draft))
}

function restoreQuizDraft() {
  const key = getDraftStorageKey()
  if (!key || !allPersons.value.length) return

  const raw = localStorage.getItem(key)
  if (!raw) return

  let draft
  try {
    draft = JSON.parse(raw)
  } catch {
    localStorage.removeItem(key)
    return
  }

  const personId = Number(draft?.evaluatedPersonId)
  const restoredPerson = allPersons.value.find(p => p.id === personId)
  if (!restoredPerson) {
    localStorage.removeItem(key)
    return
  }

  const restoredAnswers = Array.from({ length: questions.length }, (_, i) => {
    const val = Array.isArray(draft?.answers) ? draft.answers[i] : null
    return typeof val === 'number' ? val : null
  })

  const lastAnsweredIndex = restoredAnswers.reduce((last, val, i) =>
    (val === null || val === undefined ? last : i), -1
  )

  isRestoringDraft.value = true
  pendingEvaluatedPerson.value = restoredPerson
  evaluatedPerson.value = restoredPerson
  answers.value = restoredAnswers
  currentIndex.value = lastAnsweredIndex >= 0 ? lastAnsweredIndex : 0

  nextTick(() => {
    isRestoringDraft.value = false
    focusInput()
  })
}

function focusInput() {
  nextTick(() => {
    let tries = 0

    const tryFocus = () => {
      const input = inputRef.value?.$el?.querySelector('input')
      if (input) {
        input.focus()
        return
      }

      if (tries < 12) {
        tries += 1
        requestAnimationFrame(tryFocus)
      }
    }

    tryFocus()
  })
}

const currentIndex = ref(0)
const answers = ref(Array(questions.length).fill(null))
const showResults = ref(false)

// ── Init ──
onMounted(async () => {
  const { data: { session } } = await supabase.auth.getSession()
  user.value = session?.user ?? null
  loading.value = false
  if (user.value) {
    await loadPersons()
    restoreQuizDraft()
  }

  supabase.auth.onAuthStateChange(async (_event, session) => {
    user.value = session?.user ?? null
    if (user.value) {
      await loadPersons()
      restoreQuizDraft()
    }
    else resetState()
  })
})

async function loadPersons() {
  loadingPersons.value = true
  const [personsRes, resultsRes] = await Promise.all([
    supabase.from('persons').select('*').order('id'),
    supabase.from('quiz_results').select('evaluated_person_id').eq('user_id', user.value.id),
  ])
  loadingPersons.value = false

  if (personsRes.error) { personError.value = personsRes.error.message; return }
  allPersons.value = personsRes.data

  if (!resultsRes.error) {
    alreadyEvaluated.value = resultsRes.data.map(r => r.evaluated_person_id)
  }

  // Check if this user already claimed an identity
  const mine = personsRes.data.find(p => p.user_id === user.value?.id)
  if (mine) {
    myPerson.value = mine
    myPersonLocked.value = true
    pendingMyPerson.value = mine
  }
}

// ── Auth ──
async function loginWithGoogle() {
  authError.value = null
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: window.location.origin + '/quizz/' },
  })
  if (error) authError.value = error.message
}

async function logout() {
  await supabase.auth.signOut()
  resetState()
}

function resetState() {
  clearQuizDraft()
  evaluatedPerson.value = null
  pendingEvaluatedPerson.value = null
  myPerson.value = null
  myPersonLocked.value = false
  pendingMyPerson.value = null
  currentIndex.value = 0
  answers.value = Array(questions.length).fill(null)
  showResults.value = false
  allPersons.value = []
  alreadyEvaluated.value = []
}

// ── Claim identity + start ──
async function claimAndStart() {
  if (!canStart.value) return
  claimingPerson.value = true
  personError.value = null

  // Only update DB if identity not yet locked
  if (!myPersonLocked.value) {
    const { error } = await supabase
      .from('persons')
      .update({ user_id: user.value.id, is_verified: true })
      .eq('id', pendingMyPerson.value.id)
      .is('user_id', null)

    if (error) {
      personError.value = 'Цей профіль вже зайнятий. Оберіть інший.'
      await loadPersons()
      pendingMyPerson.value = null
      claimingPerson.value = false
      return
    }

    myPerson.value = pendingMyPerson.value
    myPersonLocked.value = true
    await loadPersons()
  }

  claimingPerson.value = false
  evaluatedPerson.value = pendingEvaluatedPerson.value
}

// ── Quiz logic ──
const current = computed(() => questions[currentIndex.value])
const progress = computed(() => ((currentIndex.value + 1) / questions.length) * 100)

const currentAnswer = computed({
  get: () => answers.value[currentIndex.value],
  set: (val) => {
    if (val === null || val === undefined || val === '') {
      answers.value[currentIndex.value] = null
      return
    }

    const num = Number(val)
    if (Number.isNaN(num)) return

    const clamped = Math.max(current.value.min, Math.min(current.value.max, num))
    answers.value[currentIndex.value] = clamped
  },
})

const isAnswered = computed(() =>
  currentAnswer.value !== null && currentAnswer.value !== undefined
)

function getLevelForValue(question, val) {
  if (val === null || val === undefined) return null
  return question.answers.find(a => val >= a.min && val <= a.max) ?? null
}

function isHighlighted(answer) {
  const val = currentAnswer.value
  if (val === null || val === undefined) return false
  return val >= answer.min && val <= answer.max
}

const highlightedLevel = computed(() => getLevelForValue(current.value, currentAnswer.value))

watch(currentIndex, focusInput)
watch(evaluatedPerson, (val) => { if (val) focusInput() })
watch([answers, currentIndex, evaluatedPerson, showResults], saveQuizDraft, { deep: true })

function next() { if (currentIndex.value < questions.length - 1) currentIndex.value++ }
function prev() { if (currentIndex.value > 0) currentIndex.value-- }

function handleEnter() {
  if (!isAnswered.value) return
  if (currentIndex.value < questions.length - 1) next()
  else finish()
}

async function finish() {

  const payload = {
    user_id: user.value.id,
    evaluator_person_id: myPerson.value.id,
    evaluated_person_id: evaluatedPerson.value.id,
    answers: questions.map((q, i) => ({ question_id: q.id, score: answers.value[i] })),
  }
  const { error } = await supabase.from('quiz_results').insert(payload)
  if (error) return
  clearQuizDraft()
  showResults.value = true
}
function printResults() { window.print() }

// After results, go back to select screen (keep identity, reset quiz)
async function newEvaluation() {
  evaluatedPerson.value = null
  pendingEvaluatedPerson.value = null
  currentIndex.value = 0
  answers.value = Array(questions.length).fill(null)
  showResults.value = false
  await loadPersons() // refresh already-evaluated list
}

function truncate(text, len) {
  if (!text) return ''
  return text.length > len ? text.slice(0, len) + '…' : text
}

function scoreColor(val) {
  if (val === null || val === undefined) return 'bg-gray-200 text-gray-500'
  if (val < 0) return 'bg-red-100 text-red-700'
  if (val <= 2) return 'bg-yellow-100 text-yellow-700'
  if (val <= 5) return 'bg-blue-100 text-[#4b05ff]'
  return 'bg-green-100 text-green-700'
}
</script>

<style scoped>
.slide-enter-active,
.slide-leave-active {
  transition: all 0.25s ease;
}
.slide-enter-from {
  opacity: 0;
  transform: translateX(24px);
}
.slide-leave-to {
  opacity: 0;
  transform: translateX(-24px);
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@media print {
  header button { display: none; }
}
</style>

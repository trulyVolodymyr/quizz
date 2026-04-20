import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import InputNumber from 'primevue/inputnumber'
import Button from 'primevue/button'

import 'primevue/resources/themes/lara-light-blue/theme.css'
import 'primevue/resources/primevue.min.css'
import 'primeicons/primeicons.css'
import './style.css'

import App from './App.vue'

const app = createApp(App)
app.use(PrimeVue)
app.component('InputNumber', InputNumber)
app.component('PButton', Button)
app.mount('#app')

import { setupWorker } from 'msw/browser'
import { handlers } from './handlers'

// MSWワーカーの設定とエクスポート
export const worker = setupWorker(...handlers) 
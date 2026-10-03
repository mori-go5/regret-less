import { GoogleGenAI } from '@google/genai'
import { z } from 'zod'

// リクエストのバリデーションスキーマ
const RequestSchema = z.object({
  decision: z.string().min(1).max(200),
  optionA: z.string().min(1).max(200),
  optionB: z.string().min(1).max(200),
  age: z.number().int().min(18).max(79),
})

// 各選択肢の評価スキーマ
const OptionResultSchema = z.object({
  regretScore: z.number().min(0).max(100),
  axes: z.object({
    emotionalRegret: z.number().min(0).max(100),
    opportunityLoss: z.number().min(0).max(100),
    reversibility: z.number().min(0).max(100),
    growthPotential: z.number().min(0).max(100),
    impactOnOthers: z.number().min(0).max(100),
    intuitionScore: z.number().min(0).max(100),
  }),
  timeline: z.object({
    oneYear: z.string(),
    fiveYears: z.string(),
    tenYears: z.string(),
    atEighty: z.string(),
  }),
  reversibilityWarning: z.boolean(),
})

const AnalysisResultSchema = z.object({
  optionA: OptionResultSchema,
  optionB: OptionResultSchema,
  recommendation: z.enum(['A', 'B', 'neutral']),
  commentary: z.string(),
  intuitionReveal: z.string(),
})

export type AnalysisResult = z.infer<typeof AnalysisResultSchema>

export default defineEventHandler(async (event) => {
  // リクエストボディのバリデーション
  const body = await readBody(event)
  const parsed = RequestSchema.safeParse(body)

  if (!parsed.success) {
    throw createError({
      statusCode: 400,
      message: '入力内容が正しくありません。' + parsed.error.message,
    })
  }

  const { decision, optionA, optionB, age } = parsed.data

  const config = useRuntimeConfig()
  if (!config.geminiApiKey) {
    throw createError({
      statusCode: 500,
      message: 'Gemini APIキーが設定されていません。',
    })
  }

  const ai = new GoogleGenAI({ apiKey: config.geminiApiKey })

  const prompt = `
あなたは「後悔最小化フレームワーク」の専門家です。
ユーザーが${age}歳で次の決断に直面しています。

決断: ${decision}
選択肢A: ${optionA}
選択肢B: ${optionB}

80歳の自分が振り返ったとき、どちらの選択をしなかったことをより後悔するかを分析してください。

以下のJSON形式で回答してください。すべての数値は0〜100の整数です。

{
  "optionA": {
    "regretScore": <選択肢Aの後悔リスクスコア。高いほど後悔しやすい>,
    "axes": {
      "emotionalRegret": <感情的後悔リスク>,
      "opportunityLoss": <機会損失>,
      "reversibility": <可逆性。低いほどやり直しが難しい>,
      "growthPotential": <成長可能性。高いほど成長できる>,
      "impactOnOthers": <周囲への悪影響リスク>,
      "intuitionScore": <ユーザーがこちらを望んでいる度合い>
    },
    "timeline": {
      "oneYear": "<1年後の予測（日本語の短い文）>",
      "fiveYears": "<5年後の予測>",
      "tenYears": "<10年後の予測>",
      "atEighty": "<80歳の視点での予測>"
    },
    "reversibilityWarning": <reversibility < 30 なら true、そうでなければ false>
  },
  "optionB": {
    "regretScore": <選択肢Bの後悔リスクスコア>,
    "axes": {
      "emotionalRegret": <感情的後悔リスク>,
      "opportunityLoss": <機会損失>,
      "reversibility": <可逆性>,
      "growthPotential": <成長可能性>,
      "impactOnOthers": <周囲への悪影響リスク>,
      "intuitionScore": <ユーザーがこちらを望んでいる度合い>
    },
    "timeline": {
      "oneYear": "<1年後の予測>",
      "fiveYears": "<5年後の予測>",
      "tenYears": "<10年後の予測>",
      "atEighty": "<80歳の視点での予測>"
    },
    "reversibilityWarning": <reversibility < 30 なら true>
  },
  "recommendation": "<後悔リスクが低い方: A or B。差が10点以内なら neutral>",
  "commentary": "<200字以内の分析コメント（日本語）>",
  "intuitionReveal": "<ユーザーの本音への気づき（日本語）>"
}

JSONのみ返してください。説明文は不要です。
`

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
      contents: prompt,
      config: {
        responseMimeType: 'application/json',
        temperature: 0.7,
      },
    })

    const rawJson = JSON.parse(response.text ?? '{}')
    const result = AnalysisResultSchema.safeParse(rawJson)

    if (!result.success) {
      console.error('[analyze] schema error:', result.error.message)
      throw createError({
        statusCode: 500,
        message: 'AI分析の結果が不正な形式でした。もう一度お試しください。',
      })
    }

    return result.data
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    const msg = error instanceof Error ? error.message : String(error)
    console.error('[analyze] error:', msg)
    throw createError({
      statusCode: 500,
      message: `AI分析に失敗しました: ${msg}`,
    })
  }
})

import OpenAI from 'openai'
import { z } from 'zod'

// リクエストのバリデーションスキーマ
const RequestSchema = z.object({
  decision: z.string().min(1).max(200),
  optionA: z.string().min(1).max(200),
  optionB: z.string().min(1).max(200),
  age: z.number().int().min(18).max(79),
})

// OpenAIレスポンスのスキーマ
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
  if (!config.openaiApiKey) {
    throw createError({
      statusCode: 500,
      message: 'OpenAI APIキーが設定されていません。',
    })
  }

  const openai = new OpenAI({ apiKey: config.openaiApiKey })

  const prompt = `
あなたは「後悔最小化フレームワーク」の専門家です。
ユーザーが${age}歳で次の決断に直面しています。

決断: ${decision}
選択肢A: ${optionA}
選択肢B: ${optionB}

80歳の自分が振り返ったとき、どちらの選択をしなかったことをより後悔するかを分析してください。

以下のJSON形式で回答してください。すべての数値は0〜100の整数です。
- regretScore: 後悔リスクスコア（高いほど後悔しやすい）
- axes.emotionalRegret: 感情的後悔リスク（やらなかった後悔 vs やった後悔）
- axes.opportunityLoss: 機会損失（選ばないことで失うもの）
- axes.reversibility: 可逆性（低いほどやり直しが難しい = リスク高）
- axes.growthPotential: 成長可能性（5年後の自分への影響、高いほど成長）
- axes.impactOnOthers: 周囲への影響リスク（家族・チームへの悪影響）
- axes.intuitionScore: 直感スコア（文章から読み取るユーザーの本音、高いほどこちらを望んでいる）
- timeline.*: 各時点での予測（日本語の短い文）
- reversibilityWarning: reversibility < 30 なら true
- recommendation: 後悔リスクが低い方（"A" or "B"、差が10点以内なら "neutral"）
- commentary: 200字以内の分析コメント（日本語）
- intuitionReveal: ユーザーの本音への気づき（例: "文章のトーンから、本当はBを選びたいのではないでしょうか"）

JSONのみ返してください。説明文は不要です。
`

  try {
    const response = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const rawJson = JSON.parse(response.choices[0].message.content ?? '{}')
    const result = AnalysisResultSchema.safeParse(rawJson)

    if (!result.success) {
      throw createError({
        statusCode: 500,
        message: 'AI分析の結果が不正な形式でした。もう一度お試しください。',
      })
    }

    return result.data
  } catch (error: unknown) {
    if (error && typeof error === 'object' && 'statusCode' in error) throw error
    throw createError({
      statusCode: 500,
      message: 'AI分析に失敗しました。もう一度お試しください。',
    })
  }
})

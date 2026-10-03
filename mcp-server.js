/**
 * Regret.less MCP Server (Lesson 6: MCP)
 *
 * ローカルJSONファイルに意思決定の履歴を保存し、
 * Kiroエージェントから参照できるようにするMCPサーバー。
 *
 * Tools:
 *   - save_decision: 意思決定の記録を保存する
 *   - get_decisions: 過去の意思決定一覧を取得する
 *   - get_decision_patterns: 意思決定のパターン分析を取得する
 */

import { createServer } from 'node:http'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { join } from 'node:path'

const DB_PATH = join(process.cwd(), '.decisions.json')

function loadDecisions() {
  if (!existsSync(DB_PATH)) return []
  try {
    return JSON.parse(readFileSync(DB_PATH, 'utf-8'))
  } catch {
    return []
  }
}

function saveDecisions(decisions) {
  writeFileSync(DB_PATH, JSON.stringify(decisions, null, 2), 'utf-8')
}

const TOOLS = [
  {
    name: 'save_decision',
    description: '意思決定の記録を保存する',
    inputSchema: {
      type: 'object',
      properties: {
        decision: { type: 'string', description: '決断の内容' },
        optionA: { type: 'string', description: '選択肢A' },
        optionB: { type: 'string', description: '選択肢B' },
        recommendation: { type: 'string', enum: ['A', 'B', 'neutral'], description: 'AIの推奨' },
        scoreA: { type: 'number', description: '選択肢Aの後悔リスクスコア' },
        scoreB: { type: 'number', description: '選択肢Bの後悔リスクスコア' },
      },
      required: ['decision', 'optionA', 'optionB', 'recommendation'],
    },
  },
  {
    name: 'get_decisions',
    description: '過去の意思決定一覧を取得する',
    inputSchema: {
      type: 'object',
      properties: {
        limit: { type: 'number', description: '取得件数（デフォルト: 10）' },
      },
    },
  },
  {
    name: 'get_decision_patterns',
    description: '意思決定のパターン分析を取得する（どんな決断を多くしているか）',
    inputSchema: { type: 'object', properties: {} },
  },
]

function handleTool(name, args) {
  const decisions = loadDecisions()

  if (name === 'save_decision') {
    const entry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      ...args,
    }
    decisions.push(entry)
    saveDecisions(decisions)
    return { content: [{ type: 'text', text: `意思決定を保存しました。ID: ${entry.id}` }] }
  }

  if (name === 'get_decisions') {
    const limit = args?.limit ?? 10
    const recent = decisions.slice(-limit).reverse()
    const text = recent.length === 0
      ? '保存された意思決定はありません。'
      : recent.map((d) =>
          `[${d.timestamp.slice(0, 10)}] ${d.decision}\n  A: ${d.optionA} (${d.scoreA ?? '?'}点) vs B: ${d.optionB} (${d.scoreB ?? '?'}点)\n  推奨: ${d.recommendation}`
        ).join('\n\n')
    return { content: [{ type: 'text', text }] }
  }

  if (name === 'get_decision_patterns') {
    if (decisions.length === 0) {
      return { content: [{ type: 'text', text: 'まだ意思決定の記録がありません。' }] }
    }
    const recCounts = { A: 0, B: 0, neutral: 0 }
    decisions.forEach((d) => { recCounts[d.recommendation] = (recCounts[d.recommendation] ?? 0) + 1 })
    const total = decisions.length
    const text = `意思決定パターン分析（合計 ${total} 件）\n- A推奨: ${recCounts.A}件 (${Math.round(recCounts.A / total * 100)}%)\n- B推奨: ${recCounts.B}件 (${Math.round(recCounts.B / total * 100)}%)\n- 拮抗: ${recCounts.neutral}件 (${Math.round(recCounts.neutral / total * 100)}%)`
    return { content: [{ type: 'text', text }] }
  }

  return { content: [{ type: 'text', text: `Unknown tool: ${name}` }], isError: true }
}

// stdio transport で MCP プロトコルを処理
process.stdin.setEncoding('utf-8')
let buffer = ''

process.stdin.on('data', (chunk) => {
  buffer += chunk
  const lines = buffer.split('\n')
  buffer = lines.pop() ?? ''

  for (const line of lines) {
    if (!line.trim()) continue
    try {
      const message = JSON.parse(line)
      let response = null

      if (message.method === 'initialize') {
        response = {
          jsonrpc: '2.0', id: message.id,
          result: {
            protocolVersion: '2024-11-05',
            capabilities: { tools: {} },
            serverInfo: { name: 'regret-less-history', version: '1.0.0' },
          },
        }
      } else if (message.method === 'tools/list') {
        response = { jsonrpc: '2.0', id: message.id, result: { tools: TOOLS } }
      } else if (message.method === 'tools/call') {
        const result = handleTool(message.params?.name, message.params?.arguments ?? {})
        response = { jsonrpc: '2.0', id: message.id, result }
      } else if (message.method === 'notifications/initialized') {
        continue // 通知には応答不要
      } else {
        response = {
          jsonrpc: '2.0', id: message.id,
          error: { code: -32601, message: `Method not found: ${message.method}` },
        }
      }

      if (response) {
        process.stdout.write(JSON.stringify(response) + '\n')
      }
    } catch {
      // パースエラーは無視
    }
  }
})

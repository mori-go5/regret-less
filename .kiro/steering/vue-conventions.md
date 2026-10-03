# Vue & TypeScript Conventions for Regret.less

Enforce these conventions so that all generated Vue and TypeScript code is consistent,
maintainable, and aligned with the project's style — without needing to repeat instructions each session.

## Component Style

Always use `<script setup lang="ts">` syntax. Never use the Options API or `defineComponent`.

```vue
<!-- Good -->
<script setup lang="ts">
const props = defineProps<{ score: number }>()
</script>

<!-- Bad -->
<script lang="ts">
export default defineComponent({ props: { score: Number } })
</script>
```

## TypeScript

Add explicit types to all function parameters and return values. Never use `any`.

```typescript
// Good
function normalizeScore(value: number, max: number): number {
  return Math.min(100, Math.max(0, (value / max) * 100))
}

// Bad
function normalizeScore(value, max) {
  return Math.min(100, Math.max(0, (value / max) * 100))
}
```

## Tailwind CSS

Use Tailwind v4 utility classes directly in templates. Do not write custom CSS unless absolutely necessary.
Prefer semantic color tokens (`bg-neutral-900`, `text-amber-400`) over arbitrary values.

## API Routes (Nitro)

Always validate request bodies with Zod before passing to OpenAI.
Never expose the OpenAI API key to the client — all AI calls go through server/api/.

```typescript
// Good — server-side only
const body = await readValidatedBody(event, schema.parse)

// Bad — never do this in a composable or page
const openai = new OpenAI({ apiKey: useRuntimeConfig().public.openaiApiKey })
```

## Error Handling

Always handle API errors gracefully and show user-friendly messages in Japanese.

```typescript
// Good
catch (error) {
  throw createError({ statusCode: 500, message: 'AI分析に失敗しました。もう一度お試しください。' })
}
```

## Naming

- Components: PascalCase (e.g., `RadarChart.vue`)
- Composables: camelCase prefixed with `use` (e.g., `useDecisionAnalysis.ts`)
- Server routes: kebab-case (e.g., `analyze.post.ts`)
- Types/interfaces: PascalCase (e.g., `DecisionResult`)

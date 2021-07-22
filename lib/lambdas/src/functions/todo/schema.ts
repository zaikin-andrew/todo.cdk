export default {
  type: "object",
  properties: {
    id: { type: 'string' },
    title: { type: 'string' },
    completed: { type: 'boolean' }
  },
  required: []
} as const;

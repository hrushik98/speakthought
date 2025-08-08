import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { transcript } = await request.json()
    
    if (!transcript) {
      return NextResponse.json({ error: 'No transcript provided' }, { status: 400 })
    }

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-2024-08-06',
        messages: [
          {
            role: 'system',
            content: `You are an expert at extracting actionable todo items from spoken thoughts and conversations. 

Your task is to:
1. Analyze the provided transcript carefully
2. Identify specific, actionable tasks that need to be completed
3. Convert vague thoughts into clear, concrete todo items
4. Ignore casual conversation, greetings, or non-actionable statements
5. Return ONLY the todo items as a JSON array of strings

Guidelines for good todos:
- Start with action verbs (buy, call, schedule, write, etc.)
- Be specific and clear
- Keep each item concise (under 50 characters when possible)
- Don't include duplicate or very similar items
- If someone mentions "I need to" or "I should" or "I have to", extract that as a todo
- Convert shopping lists, errands, and tasks into actionable items

Examples:
Input: "I need to buy milk and eggs, and I should call my mom later. Oh and I have to schedule that dentist appointment."
Output: ["Buy milk and eggs", "Call mom", "Schedule dentist appointment"]

Input: "Tomorrow I'm thinking about going to the gym, and I really need to finish that report for work."
Output: ["Go to the gym", "Finish work report"]

If no actionable todos can be extracted, return an empty array.`
          },
          {
            role: 'user',
            content: transcript
          }
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'todo_extraction',
            strict: true,
            schema: {
              type: 'object',
              properties: {
                todos: {
                  type: 'array',
                  items: {
                    type: 'string'
                  }
                }
              },
              required: ['todos'],
              additionalProperties: false
            }
          }
        },
        temperature: 0.3,
        max_tokens: 500
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('OpenAI API error:', error)
      return NextResponse.json({ error: 'Todo extraction failed' }, { status: 500 })
    }

    const result = await response.json()
    const parsedContent = JSON.parse(result.choices[0].message.content)
    
    return NextResponse.json({ todos: parsedContent.todos })
  } catch (error) {
    console.error('Todo extraction error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

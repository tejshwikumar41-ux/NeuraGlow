export const mockTutorData = {
  conversations: [
    {
      id: "conv_1",
      title: "Photosynthesis & Calvin Cycle",
      category: "BIOLOGY",
      lastMessage: "Rubisco is the key enzyme for carbon fixation...",
      date: "10 mins ago",
      messages: [
        {
          id: "m1",
          role: "user",
          content: "Can you explain how Rubisco works in simple terms?",
          timestamp: "10:20 AM"
        },
        {
          id: "m2",
          role: "assistant",
          content: "Think of Rubisco like a molecular magnet that grabs carbon dioxide (CO2) floating in the air and attaches it to a 5-carbon molecule inside the plant cell (RuBP).\n\n1. **Carbon Fixation:** It turns atmospheric gas into solid organic material.\n2. **The Catch:** Rubisco is sometimes slow and can accidentally grab oxygen (O2) instead—a process called photorespiration.",
          counterQuestion: "Why do you think C4 plants evolved specialized leaf anatomy to isolate Rubisco from high oxygen levels?",
          suggestions: [
            "Explain photorespiration in C4 plants",
            "Give me a real-world analogy",
            "Quiz me on Rubisco"
          ],
          timestamp: "10:21 AM"
        }
      ]
    },
    {
      id: "conv_2",
      title: "Python List Comprehensions vs Loops",
      category: "PROGRAMMING",
      lastMessage: "List comprehensions create lists concisely...",
      date: "Yesterday",
      messages: [
        {
          id: "m3",
          role: "user",
          content: "When should I use a list comprehension instead of a standard for loop?",
          timestamp: "Yesterday 4:15 PM"
        },
        {
          id: "m4",
          role: "assistant",
          content: "Use list comprehensions when you are mapping or filtering an existing sequence into a new list in a single readable step.\n\n```python\n# Standard Loop\nsquares = []\nfor x in range(10):\n    if x % 2 == 0:\n        squares.append(x**2)\n\n# List Comprehension\nsquares = [x**2 for x in range(10) if x % 2 == 0]\n```\n\nAvoid them if the logic requires multiple statements or complex exception handling!",
          counterQuestion: "Can you rewrite `[str(n) for n in numbers]` into a standard loop?",
          suggestions: [
            "Show nested list comprehension example",
            "Explain memory usage differences",
            "Give me a practice exercise"
          ],
          timestamp: "Yesterday 4:16 PM"
        }
      ]
    }
  ]
}

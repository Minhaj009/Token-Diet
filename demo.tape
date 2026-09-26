# Output file configuration
Output demo.gif
Set Shell "bash"
Set FontSize 14
Set Width 880
Set Height 520
Set Padding 20
Set WindowBar Colorful
Set Theme "TokyoNight"
Set TypingSpeed 45ms

# Initial buffer reset
Type "clear"
Enter
Sleep 600ms

# Section 1: Inspect verbose RAG/API payload
Type "# 1. Inspecting uncompressed LLM context payload..."
Sleep 500ms
Enter
Type "head -n 14 demo_payload.json"
Sleep 800ms
Enter
Sleep 2.5s

# Section 2: Run TokenDiet CLI compression
Type "# 2. Losslessly compress payload with TokenDiet..."
Sleep 500ms
Enter
Type "tokendiet compress demo_payload.json"
Sleep 900ms
Enter
Sleep 4.5s

# Section 3: Show Unix pipe streaming directly to LLM tooling
Type "# 3. Stream directly into your LLM CLI pipe..."
Sleep 500ms
Enter
Type "cat demo_payload.json | tokendiet compress | llm 'Summarize transactions'"
Sleep 900ms
Enter
Sleep 3s

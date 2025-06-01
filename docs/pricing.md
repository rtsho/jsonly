Gemini 2.0 Flash pricing:

input: $0.10 / 1M tokens
output: $0.40 / 1M tokens

Test with coxbusiness1.pdf (3 pages):

- input (prompt_token_count): 1083 --> cost = 1083/1000000*0.10
- output (candidates_token_count): 1269 --> cost = 1269/1000000*0.40
- total cost = 1083 x 0.1/1000000 + 1269 x 0.40/1000000 = **$0.0006159**

Docupipe cost: 

- Parse: 1 credit / page
- Standardize: 2 credits per page

Pricing: 

- $99/mo = 2500 credits ($0.04/credit)
- $500/mo = 20000 credits ($0.025/credit)

Let's say we only count 2 pages (to be conservative) = 2 * (1 + 2) = 6 credits

Using $0.025/credit ==> total cost = 0.025 * 6 = **$0.15**

This is 243x the raw gemini cost!!




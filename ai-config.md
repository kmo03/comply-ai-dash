# AI Model Configuration

## Current Setup
- **Default Model**: GPT-5 (most powerful available!)
- **Fallback**: GPT-5-mini (for cost optimization)
- **Alternative**: GPT-5-nano (for high-volume usage)

## Model Options Available

1. **GPT-5** (Default - Best Quality):
   ```bash
   OPENAI_MODEL=gpt-5
   ```

2. **GPT-5-mini** (Cost Optimized):
   ```bash
   OPENAI_MODEL=gpt-5-mini
   ```

3. **GPT-5-nano** (High Volume):
   ```bash
   OPENAI_MODEL=gpt-5-nano
   ```

## Model Capabilities

### GPT-5 (Current - Default)
- 🚀 **500,000 TPM** - High throughput for large datasets
- 🚀 **500 RPM** - Fast response times
- 🚀 **1,500,000 TPD** - Excellent daily limits
- 🚀 Enhanced reasoning and analysis
- 🚀 Superior B-BBEE compliance insights
- 🚀 Advanced strategic recommendations
- 🚀 Sophisticated data analysis

### GPT-5-mini (Cost Optimized)
- 💰 **500,000 TPM** - Same throughput as GPT-5
- 💰 **5,000,000 TPD** - Higher daily limits
- 💰 Lower cost per token
- 💰 Good quality for most use cases

### GPT-5-nano (High Volume)
- ⚡ **200,000 TPM** - Good throughput
- ⚡ **2,000,000 TPD** - High daily limits
- ⚡ Most cost-effective for bulk processing
- ⚡ Optimized for large-scale operations

## Configuration Options

### Environment Variables
```bash
# Required
OPENAI_API_KEY=your_api_key_here

# Optional (defaults to gpt-5)
OPENAI_MODEL=gpt-5
```

### Model Selection Strategy
- **Development**: Use `gpt-5-nano` for faster, cheaper testing
- **Production**: Use `gpt-5` for best results
- **High Volume**: Use `gpt-5-mini` for cost optimization
- **Bulk Processing**: Use `gpt-5-nano` for maximum throughput

## Cost Considerations
- **GPT-5**: Premium pricing, best quality
- **GPT-5-mini**: Balanced cost/quality ratio
- **GPT-5-nano**: Most cost-effective for high volume

## Implementation Notes
The system is designed to automatically use the configured model without code changes. Simply update the environment variable to switch models.

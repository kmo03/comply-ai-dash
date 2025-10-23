#!/bin/bash

# Script to configure GPT-5 models
# GPT-5 is now available with multiple variants!

echo "🚀 GPT-5 Configuration Options..."

echo ""
echo "Available GPT-5 Models:"
echo "1. gpt-5 (Default - Best Quality)"
echo "2. gpt-5-mini (Cost Optimized)"  
echo "3. gpt-5-nano (High Volume)"

echo ""
read -p "Select model (1-3) or press Enter for gpt-5: " choice

case $choice in
    1|"")
        MODEL="gpt-5"
        echo "✅ Selected GPT-5 (Best Quality)"
        ;;
    2)
        MODEL="gpt-5-mini"
        echo "✅ Selected GPT-5-mini (Cost Optimized)"
        ;;
    3)
        MODEL="gpt-5-nano"
        echo "✅ Selected GPT-5-nano (High Volume)"
        ;;
    *)
        MODEL="gpt-5"
        echo "✅ Defaulting to GPT-5"
        ;;
esac

echo ""
echo "🔧 Configuration:"
echo "OPENAI_MODEL=$MODEL"

echo ""
echo "📝 To update your Supabase project:"
echo "1. Go to your Supabase dashboard"
echo "2. Navigate to Settings > Edge Functions"
echo "3. Add environment variable: OPENAI_MODEL=$MODEL"
echo "4. Redeploy your functions"

echo ""
echo "🧪 To test the integration:"
echo "1. Upload a CSV file to your dashboard"
echo "2. Check the AI insights section"
echo "3. Verify the model is being used in the logs"

echo ""
echo "📊 Model Limits for $MODEL:"
if [ "$MODEL" = "gpt-5" ]; then
    echo "   • 500,000 TPM (Tokens Per Minute)"
    echo "   • 500 RPM (Requests Per Minute)"
    echo "   • 1,500,000 TPD (Tokens Per Day)"
elif [ "$MODEL" = "gpt-5-mini" ]; then
    echo "   • 500,000 TPM (Tokens Per Minute)"
    echo "   • 500 RPM (Requests Per Minute)"
    echo "   • 5,000,000 TPD (Tokens Per Day)"
elif [ "$MODEL" = "gpt-5-nano" ]; then
    echo "   • 200,000 TPM (Tokens Per Minute)"
    echo "   • 500 RPM (Requests Per Minute)"
    echo "   • 2,000,000 TPD (Tokens Per Day)"
fi

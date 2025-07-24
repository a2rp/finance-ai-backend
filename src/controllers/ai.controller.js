const axios = require("axios");
const Transaction = require("../models/Transaction");

const getAiAdvice = async (req, res) => {
    console.log("Received request for AI advice");

    try {
        const { days = 30 } = req.body;

        const fromDate = new Date();
        fromDate.setDate(fromDate.getDate() - days);

        const transactions = await Transaction.find({
            user: req.user._id,
            date: { $gte: fromDate },
        });

        const prompt = `
You're a personal finance advisor. Analyze the following transactions and return:

1. Saving advice
2. Expense warnings
3. Investment tips

Here are the transactions: 
${JSON.stringify(transactions, null, 2)}
`;

        const groqRes = await axios.post(
            "https://api.groq.com/openai/v1/chat/completions",
            {
                model: "llama3-70b-8192",
                messages: [
                    {
                        role: "system",
                        content:
                            "You are a helpful and experienced financial advisor.",
                    },
                    { role: "user", content: prompt },
                ],
                temperature: 0.7,
            },
            {
                headers: {
                    "Content-Type": "application/json",
                    Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
                },
            }
        );

        const aiReply = groqRes.data.choices[0].message.content;
        res.status(200).json({ advice: aiReply });
    } catch (err) {
        console.error("Groq AI Error:", err?.response?.data || err.message);
        res.status(500).json({ message: "AI advice generation failed" });
    }
};

module.exports = { getAiAdvice };

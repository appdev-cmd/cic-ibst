export function buildCoverageInstruction(userMessage: string): string {
    const topics = userMessage
        .split(/(?:\?|\n|và|hoặc)/)
        .map(t => t.trim())
        .filter(t => t.length > 5);
        
    if (topics.length <= 1) return '';
    
    return `\nLưu ý: Hãy đảm bảo bạn đề cập đến tất cả các chủ đề sau trong câu trả lời:\n- ` + topics.join('\n- ');
}

export function ensureResponseCoverage(
    userMessage: string,
    aiResponse: string,
    toolResults: Map<string, unknown>
): string {
    let finalResponse = aiResponse;
    
    const topics = userMessage
        .split(/(?:\?|\n|và|hoặc)/)
        .map(t => t.trim())
        .filter(t => t.length > 5);
        
    if (topics.length === 0) return finalResponse;

    const lowerResponse = finalResponse.toLowerCase();
    const missingTopics = [];

    for (const topic of topics) {
        const keywords = topic.toLowerCase().split(' ').filter(k => k.length > 3);
        const hasKeywords = keywords.some(k => lowerResponse.includes(k));
        if (!hasKeywords) {
            missingTopics.push(topic);
        }
    }

    if (missingTopics.length > 0 && toolResults.size > 0) {
        finalResponse += '\n\n**Bổ sung thông tin:**\n';
        for (const topic of missingTopics) {
            finalResponse += `- Về vấn đề "${topic}", xin vui lòng cung cấp thêm chi tiết hoặc tra cứu cụ thể hơn để tôi có thể hỗ trợ.\n`;
        }
    }

    const paragraphs = finalResponse.split('\n\n');
    const uniqueParagraphs = [];
    const paragraphCounts = new Map<string, number>();

    for (const p of paragraphs) {
        if (p.length > 50) {
            const count = paragraphCounts.get(p) || 0;
            if (count < 3) {
                uniqueParagraphs.push(p);
                paragraphCounts.set(p, count + 1);
            }
        } else {
            uniqueParagraphs.push(p);
        }
    }

    return uniqueParagraphs.join('\n\n');
}

const axios = require('axios');
const config = require('../config');

class LLMService {
  constructor() {
    this.provider = config.llm.provider;
  }

  async chat(systemPrompt, userPrompt) {
    const provider = this.provider || 'deepseek';
    if (provider === 'qwen') return this.chatWithQwen(systemPrompt, userPrompt);
    if (provider === 'glm') return this.chatWithGLM(systemPrompt, userPrompt);
    if (provider === 'deepseek') return this.chatWithDeepSeek(systemPrompt, userPrompt);
    return this.chatWithDeepSeek(systemPrompt, userPrompt);
  }

  _buildProviderConf(provider) {
    const providers = (config.llm && config.llm.providers) || {};
    return providers[provider] || {};
  }

  _parseJsonResponse(text) {
    if (typeof text === 'object' && text !== null) return text;
    const str = String(text).trim();
    try { return JSON.parse(str); } catch (e) { /* continue */ }
    const codeBlockMatch = str.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (codeBlockMatch) {
      try { return JSON.parse(codeBlockMatch[1].trim()); } catch (e) { /* continue */ }
    }
    const firstBrace = str.indexOf('{');
    const lastBrace = str.lastIndexOf('}');
    if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
      try { return JSON.parse(str.substring(firstBrace, lastBrace + 1)); } catch (e) { /* continue */ }
    }
    const firstBracket = str.indexOf('[');
    const lastBracket = str.lastIndexOf(']');
    if (firstBracket !== -1 && lastBracket !== -1 && lastBracket > firstBracket) {
      try { return JSON.parse(str.substring(firstBracket, lastBracket + 1)); } catch (e) { /* continue */ }
    }
    return text;
  }

  _handleApiError(error, providerName) {
    if (error.response) {
      const status = error.response.status;
      const errData = error.response.data;
      const errMsg = errData?.error?.message || errData?.message || JSON.stringify(errData);
      if (status === 401) {
        throw new Error(`${providerName} API 认证失败(401): API Key 无效或已过期。${errMsg}`);
      } else if (status === 400) {
        throw new Error(`${providerName} API 请求格式错误(400): ${errMsg}`);
      } else if (status === 429) {
        throw new Error(`${providerName} API 请求频率超限(429): 请稍后重试。${errMsg}`);
      } else if (status === 500 || status === 502 || status === 503) {
        throw new Error(`${providerName} API 服务异常(${status}): 请稍后重试。${errMsg}`);
      }
      throw new Error(`${providerName} API 调用失败(${status}): ${errMsg}`);
    } else if (error.code === 'ECONNABORTED') {
      throw new Error(`${providerName} API 请求超时，请稍后重试`);
    } else if (error.code === 'ECONNREFUSED' || error.code === 'ENOTFOUND') {
      throw new Error(`${providerName} API 连接失败，请检查网络或API地址`);
    }
    throw new Error(`${providerName} API 调用异常: ${error.message}`);
  }

  async chatWithDeepSeek(systemPrompt, userPrompt) {
    const apiKey = config.llm.deepseekApiKey;
    if (!apiKey) {
      throw new Error('DeepSeek API Key 未配置，请在 .env 文件中设置 DEEPSEEK_API_KEY');
    }

    const providerConf = this._buildProviderConf('deepseek');
    const apiUrl = providerConf.baseUrl || 'https://api.deepseek.com';
    const model = providerConf.model || 'deepseek-chat';

    try {
      const response = await axios.post(
        `${apiUrl}/chat/completions`,
        {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 4096
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000
        }
      );

      const text = response.data.choices[0].message.content;
      return this._parseJsonResponse(text);
    } catch (error) {
      this._handleApiError(error, 'DeepSeek');
    }
  }

  async chatWithQwen(systemPrompt, userPrompt) {
    const apiKey = config.llm.qwenApiKey;
    if (!apiKey) {
      throw new Error('Qwen API Key 未配置，请在 .env 文件中设置 QWEN_API_KEY');
    }

    const providerConf = this._buildProviderConf('qwen');
    const apiUrl = providerConf.baseUrl || 'https://dashscope.aliyuncs.com/compatible-mode/v1';
    const model = providerConf.model || 'qwen-plus';

    try {
      const response = await axios.post(
        `${apiUrl}/chat/completions`,
        {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 4096
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000
        }
      );

      const text = response.data.choices[0].message.content;
      return this._parseJsonResponse(text);
    } catch (error) {
      this._handleApiError(error, 'Qwen');
    }
  }

  async chatWithGLM(systemPrompt, userPrompt) {
    const apiKey = config.llm.glmApiKey;
    if (!apiKey || apiKey === 'your_glm_api_key_here') {
      throw new Error('GLM API Key 未配置，请在 .env 文件中设置 GLM_API_KEY');
    }

    const providerConf = this._buildProviderConf('glm');
    const apiUrl = providerConf.baseUrl || 'https://open.bigmodel.cn/api/paas/v4';
    const model = providerConf.model || 'glm-4-flash';

    try {
      const response = await axios.post(
        `${apiUrl}/chat/completions`,
        {
          model,
          messages: [
            { role: 'system', content: systemPrompt },
            { role: 'user', content: userPrompt }
          ],
          temperature: 0.7,
          max_tokens: 4096
        },
        {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: 120000
        }
      );

      const text = response.data.choices[0].message.content;
      return this._parseJsonResponse(text);
    } catch (error) {
      this._handleApiError(error, 'GLM');
    }
  }
}

module.exports = new LLMService();

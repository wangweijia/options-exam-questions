const fs = require('fs');

// Helper: parse questions where answers are at the end
function parseQuestionsWithAnswerKey(content, source) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  const questions = [];
  
  let answerLine = '';
  let questionLines = [];
  for (const line of lines) {
    if (line.startsWith('答案：') || line.startsWith('答案:')) {
      answerLine = line.replace('答案：', '').replace('答案:', '').replace(/[，、]/g, ',').trim();
    } else {
      questionLines.push(line);
    }
  }
  
  const answers = answerLine.replace(/[^A-D]/g, '').split('');
  
  let currentQuestion = null;
  let questionIndex = 0;
  
  for (const line of questionLines) {
    const match = line.match(/^(\d+)[、.](.*)/);
    if (match) {
      if (currentQuestion && currentQuestion.options.A) {
        if (answers[questionIndex]) {
          currentQuestion.answer = answers[questionIndex];
        }
        questions.push(currentQuestion);
        questionIndex++;
      }
      currentQuestion = {
        id: questionIndex + 1,
        type: 'single_choice',
        question: match[2].trim(),
        options: {},
        source: source
      };
    } else if (currentQuestion) {
      const optMatch = line.match(/^([A-D])[.、]\s*(.*)/);
      if (optMatch) {
        currentQuestion.options[optMatch[1]] = optMatch[2].trim();
      }
    }
  }
  if (currentQuestion && currentQuestion.options.A) {
    if (answers[questionIndex]) {
      currentQuestion.answer = answers[questionIndex];
    }
    questions.push(currentQuestion);
  }
  
  return questions;
}

// Parse XueQiu questions (answers inline)
function parseXueQiuQuestions(content, source) {
  const lines = content.split('\n').map(l => l.trim()).filter(l => l);
  const questions = [];
  let currentQuestion = null;
  let questionIndex = 0;
  
  for (const line of lines) {
    const match = line.match(/^(\d+)[、.]\s*(.*?)\s*\(([A-D])\)/);
    if (match) {
      if (currentQuestion && currentQuestion.options.A) {
        questions.push(currentQuestion);
        questionIndex++;
      }
      currentQuestion = {
        id: questionIndex + 1,
        type: 'single_choice',
        question: match[2].trim(),
        options: {},
        answer: match[3],
        source: source
      };
    } else if (currentQuestion) {
      const optMatch = line.match(/^([A-Dc])[.、]\s*(.*)/);
      if (optMatch) {
        const key = optMatch[1].toUpperCase();
        currentQuestion.options[key] = optMatch[2].trim();
      }
    }
  }
  if (currentQuestion && currentQuestion.options.A) {
    questions.push(currentQuestion);
  }
  
  return questions;
}

// Parse knowledge manual into Q&A format
function parseKnowledgeManual() {
  const source = '基础知识手册';
  const questions = [];
  
  function addQ(q, a, cat) {
    questions.push({
      type: 'knowledge',
      question: q,
      answer: a,
      source: source,
      category: cat
    });
  }

  addQ(
    '什么是期权？',
    '期权是交易双方关于未来买卖权利达成的合约。就股票期权来说，期权的买方（权利方）通过向卖方（义务方）支付一定的费用（即期权费或权利金），获得一种权利，即有权在约定的时间以约定的价格向期权卖方买入或卖出约定数量的标的股票或ETF。买方也可以选择放弃行使权利。如果买方决定行使权利，卖方就有义务履约。',
    '基础知识'
  );

  addQ(
    '期权的基本要素有哪些？',
    '期权的基本要素包括：合约标的、合约类型（认购/认沽）、合约到期日、合约单位、行权价格、行权价格间距、交割方式（实物交割/现金交割）。',
    '基础知识'
  );

  addQ(
    '期权按买方权利如何分类？',
    '按期权买方的权利划分，分为认购期权和认沽期权：1.认购期权是指期权买方有权在约定时间以约定价格从期权卖方手中买进一定数量标的证券的期权合约；2.认沽期权是指期权买方有权在约定时间以约定价格将一定数量标的证券卖给期权卖方的期权合约。',
    '基础知识'
  );

  addQ(
    '期权按执行时限如何分类？',
    '按期权买方执行期权的时限划分，分为欧式期权和美式期权：1.欧式期权是指期权买方只能在期权到期日行权的期权；2.美式期权是指期权买方可以在期权购买日至到期日之间任一交易日行权的期权。',
    '基础知识'
  );

  addQ(
    '期权按行权价格与标的证券市价的关系如何分类？',
    '分为实值期权、平值期权和虚值期权：1.实值期权：行权价格低于标的证券市场价格的认购期权，或行权价格高于标的证券市场价格的认沽期权；2.平值期权：行权价格与标的证券市场价格相同或最为接近的期权；3.虚值期权：行权价格高于标的证券市场价格的认购期权，或行权价格低于标的证券市场价格的认沽期权。',
    '基础知识'
  );

  addQ(
    '期权与期货的区别是什么？',
    '主要区别：1.买卖双方权利义务：期权不对等（买方有权无义务，卖方有义务），期货对等；2.保证金制度：期权仅对卖方收取，期货买卖双方均收取；3.行权履约：期权买方可选择行权或放弃，期货双方都有履约义务；4.风险收益对称性：期权不对称（买方损失有限、收益理论无限），期货对称。',
    '基础知识'
  );

  addQ(
    '期权与权证的区别是什么？',
    '主要区别：1.标准化程度：期权是标准化合约，权证是非标准化合约；2.发行主体：期权没有特定发行人，权证有特定发行主体；3.合约主体：期权买方卖方不特定，权证合约主体是发行人和买方；4.持仓类型：期权可买入也可卖出开仓，权证只能买入；5.履约担保：期权卖方缴纳保证金，权证以发行人资产或信用担保。',
    '基础知识'
  );

  addQ(
    '影响期权价格的因素有哪些？',
    '影响期权价格的因素包括：1.合约标的价格：标的价格上涨，认购期权价格上涨，认沽期权价格下跌；2.行权价：认购期权行权价越高价格越低，认沽期权行权价越高价格越高；3.到期日：到期剩余时间越长期权价格越高；4.利率：利率越高认购期权价格越高，认沽期权价格越低；5.波动率：波动率越高期权价格越高。',
    '基础知识'
  );

  addQ(
    '什么是权利金、内在价值和时间价值？',
    '权利金是期权合约的市场价格，由内在价值和时间价值组成。内在价值由行权价格与标的市场价格关系决定：认购期权内在价值=MAX(0,标的价格-行权价)，认沽期权内在价值=MAX(0,行权价-标的价格)。时间价值是权利金中超出内在价值的部分：时间价值=权利金-内在价值。',
    '基础知识'
  );

  addQ(
    '投资者面临哪些主要风险？',
    '主要风险：1.价值归零风险：虚值期权到期后价值归零；2.高溢价风险：期权价格大幅高于合理价值；3.到期不行权风险：实值期权忘记行权损失内在价值；4.交割风险：无法备齐足额现金/现券；5.流动性风险：无法及时平仓；6.保证金风险：卖方被要求追加保证金。',
    '基础知识'
  );

  addQ(
    '期权有哪些买卖指令？',
    '六种基本指令：1.买入开仓：支付权利金增加权利仓；2.卖出平仓：收入权利金减少权利仓；3.卖出开仓：缴纳保证金增加义务仓；4.买入平仓：支付权利金减少义务仓；5.备兑开仓：冻结标的证券作为保证金收入权利金；6.备兑平仓：减少备兑持仓头寸。',
    '基础知识'
  );

  addQ(
    '什么是备兑开仓？',
    '备兑开仓是指投资者在持有相应数量的标的证券后，进行备兑开仓，冻结相应数量的标的证券作为保证金，无需现金保证金，收入权利金，增加备兑持仓头寸。适合预期股票价格基本保持不变或小幅上涨时采取。',
    '基础知识'
  );

  addQ(
    '什么是保险策略？',
    '保险策略是指投资者长期持有标的证券的时候，使用期权（买入认沽期权）的保险策略降低市场风险带来的损失，而标的证券上涨的时候仍然可以享有潜在收益。盈亏平衡点=买入股票成本+买入期权的权利金。',
    '基础知识'
  );

  addQ(
    '期权有哪些常见的交易策略？',
    '常见策略分类：1.期现策略：保险策略、备兑策略、领口策略；2.方向策略：牛市价差、熊市价差、合成期货多头、合成期货空头；3.看多波动率：跨式多头、宽跨式多头、买入蝶式、买入鹰式、比率策略；4.看空波动率：跨式空头、宽跨式空头、卖出蝶式、卖出鹰式、反比率策略。',
    '基础知识'
  );

  addQ(
    '期权的行权日和交收日是哪天？',
    '行权日为每个合约到期月份的第四个星期三（遇法定节假日顺延）。行权流程：E日15:30前权利方提交行权申报，中国结算按按比例分配及按尾数大小分配原则指派，E+1日完成行权交收。投资者实际在E+2日才能卖出行权收入的标的证券。',
    '基础知识'
  );

  addQ(
    '什么是组合保证金策略？',
    '组合保证金是将符合规定要求的合约持仓构建组合，实现保证金冲销或减免，提高资金使用效率。常见策略：1.认购牛市价差(CNSJC)：保证金为零；2.认购熊市价差(CXSJC)：按行权价差计算；3.认沽牛市价差(PNSJC)：按行权价差计算；4.认沽熊市价差(PXSJC)：保证金为零；5.跨式空头(KS)和宽跨式空头(KKS)。',
    '基础知识'
  );

  addQ(
    '什么情况下会出现合约停牌？',
    '以下情况会停牌：1.标的证券停牌，对应期权合约交易停牌；2.交易所根据市场需要暂停期权交易；3.某期权合约出现异常价格波动时，交易所可暂停交易。',
    '基础知识'
  );

  addQ(
    '什么情况下会出现合约摘牌？',
    '以下情况会摘牌：1.合约到期自动摘牌；2.调整过的合约当日日终无持仓自动摘牌；3.合约标的终止上市，对应所有期权合约自动摘牌。',
    '基础知识'
  );

  addQ(
    '期权的报价方式和合约价格如何计算？',
    '期权交易按每份标的证券对应的期权报价。每张期权合约的价格=报价×合约单位。例如：某300ETF期权合约报价0.5元/份，合约单位10000份，则一张合约价格为0.5×10000=5000元。',
    '基础知识'
  );

  addQ(
    '个人投资者参与股票期权开户的准入门槛是什么？',
    '个人投资者准入门槛（根据投资者适当性管理要求）：1.申请开户时托管在公司的证券市值与资金账户可用余额合计不低于人民币50万元；2.在证券公司开户6个月以上并具备融资融券业务参与资格或金融期货交易经历；3.通过期权知识测试；4.具备期权模拟交易经历。',
    '基础知识'
  );

  return questions;
}

// Main processing
const allQuestions = [];

// 1. Parse 50ETF期权一级试题
const level1Content = fs.readFileSync('题库/50ETF期权一级试题.md', 'utf-8');
const level1Questions = parseQuestionsWithAnswerKey(level1Content, '50ETF期权一级试题');
allQuestions.push(...level1Questions);

// 2. Parse 50ETF期权二级试题
const level2Content = fs.readFileSync('题库/50ETF期权二级试题.md', 'utf-8');
const level2Questions = parseQuestionsWithAnswerKey(level2Content, '50ETF期权二级试题');
allQuestions.push(...level2Questions);

// 3. Parse 50ETF期权三级试题
const level3Content = fs.readFileSync('题库/50ETF期权三级试题.md', 'utf-8');
const level3Questions = parseQuestionsWithAnswerKey(level3Content, '50ETF期权三级试题');
allQuestions.push(...level3Questions);

// 4. Parse 雪球题目
const xueqiuContent = fs.readFileSync('题库/雪球题目 1.md', 'utf-8');
const xueqiuQuestions = parseXueQiuQuestions(xueqiuContent, '雪球题目');
allQuestions.push(...xueqiuQuestions);

// 5. Parse 基础知识 manual into Q&A
const knowledgeQuestions = parseKnowledgeManual();
allQuestions.push(...knowledgeQuestions);

// Build output
const output = {
  name: '期权知识题库',
  description: '包含50ETF期权一/二/三级考试题目、雪球期权题目及基础知识问答',
  total_questions: allQuestions.length,
  categories: {
    single_choice: allQuestions.filter(q => q.type === 'single_choice').length,
    knowledge: allQuestions.filter(q => q.type === 'knowledge').length
  },
  sources: {
    '50ETF期权一级试题': level1Questions.length,
    '50ETF期权二级试题': level2Questions.length,
    '50ETF期权三级试题': level3Questions.length,
    '雪球题目': xueqiuQuestions.length,
    '基础知识手册': knowledgeQuestions.length
  },
  questions: allQuestions
};

// Save to file
fs.writeFileSync('题库/题库.json', JSON.stringify(output, null, 2), 'utf-8');

console.log('题库生成完成！');
console.log('总计: ' + allQuestions.length + ' 道题');
console.log('  - 单选题: ' + output.categories.single_choice + ' 道');
console.log('  - 知识点问答: ' + output.categories.knowledge + ' 道');
console.log('来源分布:');
for (const [source, count] of Object.entries(output.sources)) {
  console.log('  - ' + source + ': ' + count + ' 道');
}

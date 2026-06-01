# 商品上架内容生成 Agent 评测中心

这是一个面向「商品上架内容生成 Agent」的评测中心公开版。它展示如何用数据集、实验、Trace、Grader、Failure Coding 和值班报告，把一个长链路商品上架内容生成 Agent 做成可诊断、可回归、可持续迭代的 AI 产品。

## 在线 Demo

GitHub Pages:

https://vincent-zhengwen.github.io/product-listing-agent-eval-center/

本地直接打开:

`index.html`

这个静态 Demo 内置脱敏样例数据，不依赖后端服务。

## 它在评测什么

评测对象是「商品上架内容生成 Agent」输出的一套 listing package，包括：

- 商品标题
- 商品属性
- 卖点与详情文案
- 主图序列
- 详情页结构
- Agent 执行 trace
- Grader evidence 与人工审核结论

评测中心关注的不是单次生成是否“看起来不错”，而是：每次 Agent、prompt、工具链或图片策略变化后，能否用同一批 case 复测，定位问题模式，并证明下一轮真的变好了。

## 目录结构

```text
.
├── index.html              # 可直接打开的静态评测中心 Demo
├── eval-platform-lite/     # 脱敏后的真实评测中心代码结构
│   ├── frontend/           # Next.js 前端源码
│   ├── backend/            # FastAPI API、grader、report generator
│   └── fixtures/           # 公开版 fixture 说明
├── docs/
│   └── evaluation-center.md
└── tests/                  # 公开发布结构与脱敏扫描测试
```

## 核心模块

- 数据集：把真实上架 case 固化成可复测样本。
- 实验：每次 Agent 版本变化都沉淀成一次可复现实验。
- 结果诊断：对照 source facts、Agent output、trace、grader evidence 和人工审核结论。
- 诊断分析：统计 failure code、root cause hotspot 和版本对比。
- 值班报告：把一轮实验总结成健康分、质量分、FATAL/WARNING 问题和下一轮建议。

## 公开版说明

这个仓库保留真实工程结构和核心实现，但不发布私有工作台内容。以下内容已移除或替换：

- 私有环境变量和 API key
- 真实 SQLite 数据库
- 运行日志和构建产物
- 浏览器 profile、Cookie、账号相关文件
- 原始抓取 HTML 和未脱敏 trace
- 本机绝对路径

## 本地检查

```bash
node --test tests/*.test.mjs
```

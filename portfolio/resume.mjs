// Curated from the owner's resume. The PDF at /resume.pdf is the two-page master from the
// job-search repo, copied in by `npm run sync-resume`. Claims here are resume-sourced.
// Experience, capstone and availability lines were corrected against the owner's current profile in Oct 2026.
export const resume = {
  url: '/resume.pdf',
  title: 'Sree Sankaran Chackoth — Applied ML & Agentic AI Engineer',
  supplied: '2026-10-05',
  availability: 'Open to applied AI, ML and forward-deployed engineer (FDE) roles: remote anywhere in Canada, or hybrid or on-site in Ottawa. The best first step is email.',
  summary: 'Applied AI engineer: LLM agents, evaluation and computer vision. Currently the primary engineer on an industry partner’s AI platform at Lambton College.',
  experience: [
    'AI Research Technician / AI Specialist, Lambton College × EventLinx (eventlinx.com), Feb 2026–Present: primary engineer on EventLinx’s AI platform. Built and launched a WhatsApp agent that promoters use to run events and check sales by chat, the 45-tool MCP server (TypeScript) that connects the agents to the company’s PostgreSQL database, and an email agent that drafts support replies for staff to approve. Made every database change wait for the user’s confirmation and cut worst-case reply time by about 70%. Set up release testing: LLM-judged test conversations, red-team tests and 2,000+ automated tests in CI. Trained YOLO11 and a custom ResNet18 on GPUs (Lightning AI) with real and synthetic seat maps, benchmarked on 250+ venue maps, then replaced them with an Azure OpenAI vision service that hit expected seat counts on all 5 benchmark venues.',
    'AI Research Assistant, Algonquin College Applied Research, Apr–Dec 2025: led a research team writing AI proposals with 5+ government stakeholders, aligned with Mitacs, NSERC ARD and Horizon Europe grants.',
    'FutureCanada, capstone with IRCC, Jan–Apr 2025: lead contributor in a five-person team forecasting immigration’s impact on housing and education. Capstone project, not a claim of government employment.',
    'AI/ML Engineer & Team Lead, CSE Canada capstone, Jan–Apr 2024: malware classifier on 8M+ records; LightGBM chosen over Logistic Regression, Random Forest and XGBoost, shipped as a Windows command-line tool.',
    'Python Application Developer, Infidata Technologies, Mar–Jun 2022: AWS Lambda/RDS ETL and CodeDeploy workflows.',
  ],
  additionalProjects: [
    'BogdAI: Microsoft Agents League Hackathon 2026 team prototype for synthetic contract risk analysis. Sree wrote most of the backend.',
    'Hasten: an offline phone app that captures and plans ideas on the device. Sole developer, built with Claude Code.',
    'Customer churn: predictive analytics and a proposed RAG workflow for retention actions.',
    'AI for Regulatory Compliance: LangGraph multi-agent RAG system that retrieves regulatory evidence, reasons over internal processes, detects compliance gaps, and creates or updates Jira tickets.',
    'Customer Churn Intelligence Agent: churn model combining transaction features with BERT sentiment signals (85% AUC), plus a LangChain agent with Mistral that generates targeted retention actions.',
  ],
  skills: ['Python', 'PyTorch', 'TensorFlow/Keras', 'scikit-learn', 'OpenCV', 'YOLO', 'OCR', 'LightGBM', 'XGBoost', 'LangGraph', 'LangChain', 'Microsoft Foundry', 'Microsoft Agent Framework', 'RAG', 'MCP', 'Hugging Face', 'Mistral', 'BERT', 'LLM fine-tuning/pre-training', 'guardrails', 'n8n automation', 'Lightning AI', 'AWS (EC2, Lambda, SageMaker, CodeDeploy)', 'Docker', 'Kubernetes', 'GitHub Actions', 'Terraform', 'MLflow', 'REST APIs', 'SQL', 'PySpark', 'Databricks', 'Airflow', 'Power BI'],
  // Confirmed by Sree in Sep 2026 but not in the PDF. Not shown in any project on the site.
  additionalSkills: ['OpenAI and Azure OpenAI APIs', 'vector databases', 'LLM quantization and model serving', 'LLM evaluation', 'Hugging Face Transformers', 'PEFT and LoRA', 'NumPy', 'Matplotlib', 'Seaborn', 'statsmodels', 'PostgreSQL', 'MySQL', 'Git', 'Linux', 'Bash', 'Streamlit', 'Weights & Biases', 'ONNX', 'TensorRT', 'Google Cloud', 'Snowflake', 'Kafka', 'FastAPI', 'Pydantic', 'Gradio'],
  community: [
    'Public AI/MLOps writing with 5,000+ monthly readers on multi-agent workflows, model quantization, and applied ML.',
    'Administrator of a 600+ member AI-careers Discord.',
    'Open-source contributor on GitHub and Hugging Face.',
    'Member of the Google Cloud Developers Community, Ottawa.',
  ],
  certifications: ['AI Applications with Azure (LinkedIn Learning)', 'Generative AI with OpenAI (DeepLearning.AI)', 'DevOps Foundations Series (LinkedIn Learning)'],
  education: ['Algonquin College: BI Systems Infrastructure, 2025; AI Software Development, 2024.', 'Presidency University: B.Tech Electronics & Communication Engineering, 2022.'],
};

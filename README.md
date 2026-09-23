<p align="center"><img src="./assets/profile-header.svg" alt="Terminal banner: $ whoami, Sree Sankaran Chackoth, applied AI and ML engineer, forward-deployed engineer, based in Ontario, Canada" width="100%" /></p>

I'm Sree, an applied AI and ML engineer and forward-deployed engineer (FDE) based in Ontario, Canada. Most of my work starts with a business problem and a pile of data: I work with the people who have the problem to pin down what they need, then clean the data, build the model or agent, check that it actually helps, and ship it. Right now I'm leading an applied AI project with an industry partner at Lambton College.

[Portfolio](https://just-sree.vercel.app) · [Resume](https://just-sree.vercel.app/resume.pdf) · [LinkedIn](https://linkedin.com/in/sreesankaranc) · [Email](mailto:sreechackoth@gmail.com)

The portfolio has a small agent that answers questions about my projects from my notes and resume.

## Projects

Click a project to expand it.

<details>
<summary><b>IRCC immigration forecasting</b> · capstone, 2024–25 · 2M+ records, 85%+ accuracy</summary>
<br>

I wrote the Python ETL that took 2M+ raw records down to clean time series (99.5% data quality), then compared Prophet, ARIMA and exponential smoothing across 15+ immigration categories and several forecast horizons. The best models got above 85% accuracy.

There's no public repo for this one. The details are on my [resume](https://just-sree.vercel.app/resume.pdf).

</details>

<details>
<summary><b>BogdAI contract risk review</b> · hackathon team entry, 2026 · six agents</summary>
<br>

Our entry for the Microsoft Agents League hackathon (Reasoning Agents track). Six agents review a contract in turn: intake, clause extraction, grounding, risk reasoning, verification and reporting. It uses Microsoft Foundry for policy grounding and reasoning. The output is a Pydantic report with citations for each finding, flags on high-risk items for a person to review, and the full agent trace. It runs on synthetic healthcare and pharma contracts, with a local fallback so it can be demoed without cloud credentials.

It was a team project, and the repo doesn't break down who did what. [Repository](https://github.com/anunjinb/bogdai-contract-risk-agent)

</details>

<details>
<summary><b>Regulatory compliance agent</b> · LangGraph, RAG, Jira</summary>
<br>

A multi-agent RAG system in LangGraph. It retrieves the relevant regulations, reasons over how the internal process actually works, flags compliance gaps, and creates or updates Jira tickets, so legal requirements become engineering work.

</details>

<details>
<summary><b>Churn intelligence agent</b> · BERT, LangChain, Mistral · 85% AUC</summary>
<br>

The churn model combines transaction features with BERT sentiment signals and reached 85% AUC. A LangChain agent running Mistral then turns the model's output into targeted retention actions. It grew out of an earlier churn study that proposed a RAG workflow for retention. [Repository (earlier study)](https://github.com/just-sree/Churn-Forecasting-and-Strategic-Retention-Using-Data-Analytics---A)

</details>

<details>
<summary><b>CSE threat classifier</b> · capstone · 8M+ records, Windows CLI</summary>
<br>

Malware classification for CSE Canada on 8M+ records with very uneven classes. I led the team. We tried logistic regression, random forest, XGBoost and LightGBM, and the imbalance held LightGBM to 63%, which is the number we reported. It ships as a Windows CLI that handles 10k+ files an hour.

</details>

<details>
<summary><b>SceneSense</b> · object detection, scene descriptions and audio</summary>
<br>

A Gradio app. Give it a photo and it finds the objects with DETR, writes a short description of the scene, and can read it aloud in more than one language. [Repository](https://github.com/just-sree/Object-Detection-using-HF)

</details>

<details>
<summary><b>11 more projects</b> · smaller tools, models and studies</summary>
<br>

- [Text-to-audio summariser](https://github.com/just-sree/AI-text-to-voice-summary-converter): summarises a document with an LLM, then reads the summary aloud
- [Code documentation generator](https://github.com/just-sree/ai-code-doc-generator): uses a language model to write docs for source code
- [Border traffic anomaly detection](https://github.com/just-sree/Advanced-Anomaly-Detection-in-Canadian-Border-Traffic): spotting unusual traveller volumes at Canadian ports of entry
- [Crypto price forecasting](https://github.com/just-sree/CryptoForecasts): Prophet on historical crypto prices
- [Real estate price prediction](https://github.com/just-sree/Real-Estate-Price-Prediction-using-Random-Forest): random forest regression on property features
- [UCLA admission prediction](https://github.com/just-sree/Neural-Network-Predicting-Chances-of-Admission-at-UCLA-): a neural network that estimates admission chances
- [Loan eligibility model](https://github.com/just-sree/Loan-Eligibility-Model): a loan eligibility classifier
- [Credit eligibility app](https://github.com/just-sree/credit_eligibility_application): credit eligibility prediction with an app around it
- [Walmart Canada data model](https://github.com/just-sree/Retail-Intelligence-Architecture--A-Data-Modeling-Framework-for-Walmart-Canada): a dimensional model covering sales, inventory, e-commerce, real estate and employee benefits
- [Mall customer segmentation](https://github.com/just-sree/Mall-Customer-Segmentation-Model-using-Clustering): clustering mall customers into segments
- [Pistachio anomaly detection](https://github.com/just-sree/Anomaly_Detection_and_Classification_for_Pistachio_Datasets): anomaly detection and classification on differently processed pistachio datasets

</details>

<details>
<summary><b>In progress</b> · 3 projects</summary>
<br>

- [OCR Proofkit](https://github.com/just-sree/ocr-proofkit): checking and correcting OCR output that's almost right
- [Quota Journal](https://github.com/just-sree/quota-journal): tracking API usage against quotas and rate limits
- [Quantization Demystified](https://github.com/just-sree/Quantization-Demystified): how quantised models trade precision for speed and memory

</details>

## Experience

- **AI Research Technician / AI Specialist**, Lambton College × EventLinx.com (Feb 2026 to now): leading a project with an industry partner. Model development, synthetic training data, benchmarking, error analysis and GPU inference on Lightning AI.
- **AI Research Assistant**, Algonquin College Applied Research (Apr to Dec 2025): research proposals for Horizon Europe-aligned AI work, which led to an initial $150K funding commitment.
- **Co-founder, AI Lead**, [Paresium](https://paresium.com) (ongoing): a startup I co-founded, where I lead the AI work.
- **Python Application Developer**, Infidata Technologies (Mar to Jun 2022): an event-driven ETL on AWS Lambda and RDS that refreshed data hourly and saved an estimated 40 hours a month of manual QA.

## Education

- **Algonquin College**: graduate certificates in AI Software Development (2024) and BI Systems Infrastructure (2025)
- **Presidency University**: B.Tech in Electronics and Communication Engineering (2022)

## Writing and community

- AI and MLOps writing on multi-agent workflows, model quantization and applied ML, read by 5,000+ people a month
- Admin of an AI-careers Discord with 600+ members
- Open-source contributor on [GitHub](https://github.com/just-sree) and Hugging Face
- Member of the Google Cloud Developers Community, Ottawa
- Certifications: AI Applications with Azure (LinkedIn Learning), Generative AI with OpenAI (DeepLearning.AI), DevOps Foundations (LinkedIn Learning)

## Stack

- **ML:** PyTorch, TensorFlow, Keras, scikit-learn, XGBoost, LightGBM, Prophet
- **Vision:** OpenCV, YOLO, OCR, Hugging Face, Gradio
- **LLMs and agents:** LangGraph, LangChain, Microsoft Foundry, Microsoft Agent Framework, RAG, MCP, Mistral, BERT, LLM fine-tuning, guardrails, Pydantic, n8n
- **MLOps and cloud:** AWS (EC2, Lambda, SageMaker, CodeDeploy), Azure, Lightning AI, Docker, Kubernetes, Terraform, GitHub Actions, MLflow, FastAPI, REST APIs
- **Data:** Python, pandas, SQL, PySpark, Databricks, Airflow, Power BI

Email is the best way to reach me: [sreechackoth@gmail.com](mailto:sreechackoth@gmail.com)

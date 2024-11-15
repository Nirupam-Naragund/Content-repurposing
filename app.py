from flask import Flask, render_template, request, jsonify
from crewai import Agent, Task, Crew
from langchain_groq import ChatGroq
import json
import os
from flask_cors import CORS
import speech_recognition as sr

app = Flask(__name__)
CORS(app)
# Initialize your LLM and CrewAI components
llm = ChatGroq(
    temperature=0,
    model_name="llama3-70b-8192",
    api_key='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'
)

# Define your agents
planner = Agent(
    llm=llm,
    role="Content Planner",
    goal="Plan engaging and factually accurate content on {topic}",
    backstory="You're working on planning a blog article "
              "about the topic: {topic}."
              "You collect information that helps the "
              "audience learn something "
              "and make informed decisions. "
              "Your work is the basis for "
              "the Content Writer to write an article on this topic.",
    allow_delegation=False,
    verbose=True
)

writer = Agent(
    llm=llm,
    role="Content Writer",
    goal="Write insightful and factually accurate "
         "opinion piece about the topic: {topic}",
    backstory="You're a versatile content creator who writes compelling content "
              "across different platforms while maintaining consistent messaging "
              "and brand voice.",
    allow_delegation=False,
    verbose=True
)

editor = Agent(
    llm=llm,
    role="Content Editor",
    goal="Edit and optimize content across all formats",
    backstory="You ensure all content pieces maintain consistent quality, "
              "brand voice, and messaging while being optimized for their "
              "respective platforms.",
    allow_delegation=False,
    verbose=True
)

social_media_specialist = Agent(
    llm=llm,
    role="Social Media Specialist",
    goal="Create platform-specific social media content for {topic}",
    backstory="You specialize in crafting engaging social media content "
              "optimized for Twitter, LinkedIn, and other platforms.",
    allow_delegation=False,
    verbose=True
)

video_scriptwriter = Agent(
    llm=llm,
    role="Video Scriptwriter",
    goal="Create engaging video scripts for {topic}",
    backstory="You write compelling video scripts that maintain viewer "
              "attention while delivering valuable information.",
    allow_delegation=False,
    verbose=True
)

email_marketer = Agent(
    llm=llm,
    role="Email Marketing Specialist",
    goal="Create converting email marketing campaigns for {topic}",
    backstory="You specialize in writing email sequences that engage "
              "subscribers and drive desired actions.",
    allow_delegation=False,
    verbose=True
)

visual_prompter = Agent(
    llm=llm,
    role="Visual Content Prompter",
    goal="Create detailed image generation prompts for {topic}",
    backstory="You excel at writing detailed prompts for AI image "
              "generation tools that align with the content strategy.",
    allow_delegation=False,
    verbose=True
)

# Define tasks for each role
plan = Task(
    description=( 
        "1. Analyze the topic and develop a unified content strategy\n"
        "2. Identify target audiences across different platforms\n"
        "3. Create platform-specific content guidelines\n"
        "4. Develop key messaging points and SEO keywords\n"
        "5. Outline content requirements for each format"
    ),
    expected_output="A comprehensive content strategy document with "
                    "platform-specific guidelines and messaging framework.",
    agent=planner
)

write_blog = Task(
    description=(
        "1. Create an SEO-optimized blog post\n"
        "2. Include engaging headers and subheaders\n"
        "3. Incorporate relevant keywords naturally\n"
        "4. Add calls-to-action\n"
        "5. Optimize for readability"
    ),
    expected_output="A complete blog post in markdown format with "
                    "SEO optimization and proper formatting.",
    agent=writer
)

create_tweets = Task(
    description=(
        "1. Create a thread of 5-7 engaging tweets\n"
        "2. Include relevant hashtags\n"
        "3. Optimize for engagement\n"
        "4. Include call-to-actions"
    ),
    expected_output="A tweet thread with engaging content and "
                    "appropriate hashtags.",
    agent=social_media_specialist
)

create_linkedin_post = Task(
    description=(
        "1. Write a professional LinkedIn post\n"
        "2. Include relevant hashtags\n"
        "3. Optimize for B2B audience\n"
        "4. Add compelling call-to-action"
    ),
    expected_output="A LinkedIn post optimized for professional "
                    "audience engagement.",
    agent=social_media_specialist
)

create_video_script = Task(
    description=(
        "1. Write an engaging video script\n"
        "2. Include hook, main content, and call-to-action\n"
        "3. Add timestamps and scene descriptions\n"
        "4. Include b-roll suggestions"
    ),
    expected_output="A complete video script with timing, "
                    "visuals, and dialogue.",
    agent=video_scriptwriter
)

create_email_campaign = Task(
    description=(
        "1. Create email subject lines\n"
        "2. Write email body content\n"
        "3. Include personalization elements\n"
        "4. Add compelling CTAs"
    ),
    expected_output="A complete email marketing sequence "
                    "with subject lines and body content.",
    agent=email_marketer
)

create_image_prompts = Task(
    description=(
        "1. Create detailed image generation prompts\n"
        "2. Include style, mood, and composition details\n"
        "3. Specify important visual elements\n"
        "4. Add technical requirements"
    ),
    expected_output="Detailed image generation prompts for "
                    "each content piece.",
    agent=visual_prompter
)

# Initialize crew
crew = Crew(
    agents=[planner, writer, editor, social_media_specialist, video_scriptwriter, email_marketer, visual_prompter],
    tasks=[plan, write_blog, create_email_campaign, create_image_prompts, create_linkedin_post, create_video_script, create_tweets],
    verbose=2
)

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/speech_to_text', methods=['POST'])
def speech_to_text():
    recognizer = sr.Recognizer()

    try:
        # Get the audio file from the form data
        audio_file = request.files['audio']
        audio_path = os.path.join('uploads', 'audio.wav')
        audio_file.save(audio_path)

        # Process the audio
        with sr.AudioFile(audio_path) as source:
            audio = recognizer.record(source)

        text = recognizer.recognize_google(audio)
        return jsonify({"success": True, "text": text})

    except Exception as e:
        return jsonify({"success": False, "error": str(e)})

@app.route('/process_input', methods=['POST'])
def process_input():
    data = request.json
    text_input = data.get('text', '')

    try:
        # Generate content for each task
        content_strategy_crew = Crew(agents=[planner], tasks=[plan], verbose=2)
        content_strategy_result = content_strategy_crew.kickoff(inputs={"topic": text_input})
        
        blog_post_crew = Crew(agents=[writer], tasks=[write_blog], verbose=2)
        blog_post_result = blog_post_crew.kickoff(inputs={"topic": text_input})
        
        tweet_crew = Crew(agents=[social_media_specialist], tasks=[create_tweets], verbose=2)
        tweet_result = tweet_crew.kickoff(inputs={"topic": text_input})
        
        linkedin_post_crew = Crew(agents=[social_media_specialist], tasks=[create_linkedin_post], verbose=2)
        linkedin_post_result = linkedin_post_crew.kickoff(inputs={"topic": text_input})
        
        video_script_crew = Crew(agents=[video_scriptwriter], tasks=[create_video_script], verbose=2)
        video_script_result = video_script_crew.kickoff(inputs={"topic": text_input})
        
        email_campaign_crew = Crew(agents=[email_marketer], tasks=[create_email_campaign], verbose=2)
        email_campaign_result = email_campaign_crew.kickoff(inputs={"topic": text_input})
        
        image_prompts_crew = Crew(agents=[visual_prompter], tasks=[create_image_prompts], verbose=2)
        image_prompts_result = image_prompts_crew.kickoff(inputs={"topic": text_input})

        # Combine all task results into a nested JSON response
        response_data = {
            "success": True,
            "results": {
                "content_strategy": {
                    "description": "Detailed content strategy for the topic.",
                    "output": content_strategy_result
                },
                "blog_post": {
                    "description": "Blog post content based on the topic.",
                    "output": blog_post_result
                },
                
                "twitter": {
                        "description": "Tweets generated for the topic.",
                        "output": tweet_result
                },
                "linkedin": {
                        "description": "LinkedIn post generated for the topic.",
                        "output": linkedin_post_result
                    }
                },
                "video_script": {
                    "description": "Video script content based on the topic.",
                    "output": video_script_result
                },
                "email_campaign": {
                    "description": "Email campaign sequence for the topic.",
                    "output": email_campaign_result
                },
                "image_prompts": {
                    "description": "Prompts for creating visual content.",
                    "output": image_prompts_result
                }
            }
        
        
        return jsonify(response_data)

    except Exception as e:
        return jsonify({"success": False, "error": str(e)})


if __name__ == '__main__':
    app.run(debug=True)

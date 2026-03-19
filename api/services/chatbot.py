#!/usr/bin/env python3
"""
Simple Agriculture Chatbot - Python Version
Trained with basic agricultural Q&A
"""

import json
import sys
import random
import re


class AgroBotChatbot:
    def __init__(self):
        self.training_data = [
            # Greetings (HIGH PRIORITY)
            {"question": "hi", "answer": "Hi there! Welcome to Agrobot. How can I help you with your agricultural questions?", "priority": 10},
            {"question": "hello", "answer": "Hello! I'm Agrobot, your agricultural assistant. What would you like to know?", "priority": 10},
            {"question": "hey", "answer": "Hey! Feel free to ask me anything about farming and agriculture.", "priority": 10},
            {"question": "greetings", "answer": "Greetings! I'm Agrobot, ready to answer all your agriculture questions.", "priority": 10},
            
            # About the bot
            {"question": "what is your name", "answer": "I'm Agrobot, your agricultural expert assistant.", "priority": 9},
            {"question": "who are you", "answer": "I'm Agrobot, created to help you with agriculture and farming questions.", "priority": 9},
            {"question": "who created you", "answer": "I was created by Dewshan Gunawardena.", "priority": 9},
            {"question": "who is your creator", "answer": "I was created by Dewshan Gunawardena.", "priority": 9},
            {"question": "what can you do", "answer": "I can answer questions about agriculture, farming, crop diseases, pest management, soil management, fertilizers, and much more.", "priority": 9},
            {"question": "what is your job", "answer": "My job is to help you with your agriculture-related questions and provide helpful information about farming practices.", "priority": 9},
            
            # General farming
            {"question": "what is farming", "answer": "Farming is the process of cultivating plants and raising livestock for food, fiber, and other products. It includes preparing soil, planting seeds, and harvesting crops.", "priority": 8},
            {"question": "what is agriculture", "answer": "Agriculture is the practice of cultivating crops and livestock. It's one of the most important activities for food production and economic development.", "priority": 8},
            {"question": "why is agriculture important", "answer": "Agriculture provides food security, employs billions worldwide, and contributes to economies. In India, it's the backbone, producing staples like rice and wheat.", "priority": 8},
            {"question": "what are the branches of agriculture", "answer": "The five main branches are: 1) Agronomy (soil and crops), 2) Horticulture (fruits/vegetables), 3) Animal science (livestock), 4) Agricultural engineering (machinery), 5) Agricultural economics (business/finance).", "priority": 8},
            
            # Farm operations
            {"question": "how do i start farming", "answer": "Start farming by: 1) Assessing your land and climate, 2) Planning what crops to grow, 3) Preparing your soil, 4) Getting necessary tools and seeds, 5) Starting small and learning as you go.", "priority": 7},
            {"question": "how to start a farm", "answer": "Start farming by: 1) Assessing your land and climate, 2) Planning what crops to grow, 3) Preparing your soil, 4) Getting necessary tools and seeds, 5) Starting small and learning as you go.", "priority": 7},
            {"question": "what is soil preparation", "answer": "Soil preparation involves tilling, adding organic matter or compost, testing soil pH, and ensuring proper drainage to create ideal growing conditions for crops.", "priority": 7},
            {"question": "how do i prepare soil", "answer": "Soil preparation involves tilling, adding organic matter or compost, testing soil pH, and ensuring proper drainage to create ideal growing conditions for crops.", "priority": 7},
            {"question": "how often should i water crops", "answer": "Watering frequency depends on crop type, season, and soil moisture. Typically, crops need 1-2 inches of water per week. Check soil moisture before watering.", "priority": 7},
            {"question": "how to water crops", "answer": "Watering frequency depends on crop type, season, and soil moisture. Typically, crops need 1-2 inches of water per week. Check soil moisture before watering.", "priority": 7},
            {"question": "when is the best time to plant", "answer": "Planting time depends on your crop and climate zone. Generally, plant in spring after the last frost. Consult local agricultural extension for your specific region.", "priority": 7},
            {"question": "when to plant crops", "answer": "Planting time depends on your crop and climate zone. Generally, plant in spring after the last frost. Consult local agricultural extension for your specific region.", "priority": 7},
            
            # Pests and diseases
            {"question": "how do i prevent crop diseases", "answer": "Prevent crop diseases by: 1) Using disease-resistant varieties, 2) Practicing crop rotation, 3) Maintaining proper spacing, 4) Removing infected plants, 5) Using proper sanitation.", "priority": 7},
            {"question": "how to prevent disease", "answer": "Prevent crop diseases by: 1) Using disease-resistant varieties, 2) Practicing crop rotation, 3) Maintaining proper spacing, 4) Removing infected plants, 5) Using proper sanitation.", "priority": 7},
            {"question": "what is pest management", "answer": "Pest management includes using pesticides safely, introducing natural predators, crop rotation, and using organic methods like neem oil to control harmful insects.", "priority": 7},
            {"question": "how is pest management done", "answer": "Pest management includes using pesticides safely, introducing natural predators, crop rotation, and using organic methods like neem oil to control harmful insects.", "priority": 7},
            {"question": "how do i deal with pests", "answer": "Deal with pests by: 1) Identifying the pest correctly, 2) Using targeted organic or chemical solutions, 3) Following safety guidelines, 4) Monitoring your crops regularly.", "priority": 7},
            {"question": "how to control pests", "answer": "Deal with pests by: 1) Identifying the pest correctly, 2) Using targeted organic or chemical solutions, 3) Following safety guidelines, 4) Monitoring your crops regularly.", "priority": 7},
            
            # Fertilizers
            {"question": "what are fertilizers", "answer": "Fertilizers are substances containing nutrients (nitrogen, phosphorus, potassium) that enrich soil and promote plant growth.", "priority": 7},
            {"question": "what is fertilizer", "answer": "Fertilizers are substances containing nutrients (nitrogen, phosphorus, potassium) that enrich soil and promote plant growth.", "priority": 7},
            {"question": "when should i apply fertilizer", "answer": "Apply fertilizer according to your crop's growth stage. Generally, apply at planting and during active growth. Organic fertilizers can be applied more frequently than chemical ones.", "priority": 7},
            {"question": "when to fertilize", "answer": "Apply fertilizer according to your crop's growth stage. Generally, apply at planting and during active growth. Organic fertilizers can be applied more frequently than chemical ones.", "priority": 7},
            {"question": "what is npk", "answer": "NPK stands for Nitrogen (N), Phosphorus (P), and Potassium (K) - the three essential macronutrients for plant growth.", "priority": 7},
            {"question": "what does npk mean", "answer": "NPK stands for Nitrogen (N), Phosphorus (P), and Potassium (K) - the three essential macronutrients for plant growth.", "priority": 7},
        ]
        
        self.default_responses = [
            "That's an interesting question! While I don't have a specific answer for that, I'd recommend consulting with local agricultural experts.",
            "I'm not sure about that specific topic. Please rephrase your question or ask about farming, crops, pests, diseases, fertilizers, or soil management.",
            "Sorry, I don't have detailed information on that. Is there something else about agriculture I can help you with?",
            "That's a great question! I'd suggest reaching out to agricultural extension services in your area for specialized advice.",
        ]
    
    def preprocess_text(self, text):
        """Preprocess text: lowercase, remove punctuation, split into words"""
        text = text.lower().strip()
        # Remove punctuation
        text = re.sub(r'[?!.,;:\']', '', text)
        # Split into words
        words = text.split()
        return words
    
    def exact_match(self, user_input, question):
        """Check for exact match"""
        user_clean = user_input.lower().strip()
        question_clean = question.lower().strip()
        return user_clean == question_clean
    
    def calculate_similarity(self, user_input, question):
        """Calculate similarity with multiple strategies"""
        user_clean = user_input.lower().strip()
        question_clean = question.lower().strip()
        
        # Strategy 1: Exact match
        if user_clean == question_clean:
            return 1.0
        
        # Strategy 2: Contains match
        if user_clean in question_clean or question_clean in user_clean:
            return 0.95
        
        # Strategy 3: Word-based Jaccard similarity
        user_words = set(self.preprocess_text(user_input))
        question_words = set(self.preprocess_text(question))
        
        if len(user_words) == 0 or len(question_words) == 0:
            return 0.0
        
        # Jaccard similarity
        intersection = len(user_words & question_words)
        union = len(user_words | question_words)
        jaccard = intersection / union if union > 0 else 0.0
        
        return jaccard
    
    def get_response(self, user_input):
        """Get response for user input and return both answer and confidence score"""
        if not user_input or not user_input.strip():
            return "Please ask me a question about agriculture or farming.", 0
        
        if user_input.lower().strip() == "bye":
            return "Goodbye! Feel free to come back anytime you have agriculture questions.", 100
        
        # Find best match
        best_match = None
        best_similarity = 0
        best_priority = -1
        similarity_threshold = 0.3
        
        for item in self.training_data:
            similarity = self.calculate_similarity(user_input, item["question"])
            priority = item.get("priority", 0)
            
            # Prioritize by: similarity first, then priority
            is_better = (similarity > best_similarity) or (similarity == best_similarity and priority > best_priority)
            
            if is_better:
                best_similarity = similarity
                best_match = item
                best_priority = priority
        
        # Convert similarity score (0-1) to confidence percentage (0-100)
        confidence = int(best_similarity * 100)
        
        if best_match and best_similarity >= similarity_threshold:
            return best_match["answer"], confidence
        
        # Return random default response with low confidence
        return random.choice(self.default_responses), confidence


def main():
    """Main function - reads message from stdin and returns response with confidence"""
    try:
        # Read message from stdin
        raw_input = sys.stdin.read().strip()
        
        if not raw_input:
            print(json.dumps({"error": "No input provided"}))
            sys.exit(1)
            
        try:
            # First try parsing as JSON (from updated node api)
            input_data = json.loads(raw_input)
            user_message = input_data.get("message", "")
            training_data = input_data.get("trainingData", [])
        except json.JSONDecodeError:
            # Fallback to plain string
            user_message = raw_input
            training_data = []
            
        if not user_message:
            print(json.dumps({"error": "No message provided"}))
            sys.exit(1)
        
        chatbot = AgroBotChatbot()
        
        # Add dynamic training data from the database
        if training_data:
            chatbot.training_data.extend(training_data)
        
        response, confidence = chatbot.get_response(user_message)
        
        # Return response with confidence score
        print(json.dumps({
            "userMessage": user_message,
            "botResponse": response,
            "confidence": confidence
        }))
    except Exception as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(1)


if __name__ == "__main__":
    main()

# importing required libraries
import random
import json
import torch
from model import NeuralNet
from nltk_funcs import bag_of_words, stem , tokenize

device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

with open('intents.json', 'r') as json_data:
    intents = json.load(json_data)
with open('courses.json', 'r') as json_data:
    courses = json.load(json_data)

FILE = "data.pth"
data = torch.load(FILE)

input_size = data["input_size"]
hidden_size = data["hidden_size"]
output_size = data["output_size"]
all_words = data['all_words']
tags = data['tags']
model_state = data["model_state"]

model = NeuralNet(input_size, hidden_size, output_size).to(device)
model.load_state_dict(model_state)
model.eval()

def get_response(sentence):

    sentence = tokenize(sentence)
    X = bag_of_words(sentence, all_words)
    X = X.reshape(1, X.shape[0])
    X = torch.from_numpy(X).to(device)

    output = model(X)
    _, predicted = torch.max(output, dim=1)

    tag = tags[predicted.item()]

    probs = torch.softmax(output, dim=1)
    prob = probs[0][predicted.item()]
    if prob.item() > 0.75:

        if tag=="time":
            for word in sentence:
                if word in courses:
                    return (f"The duration of {courses[word]['name']} course is {courses[word][tag]}")
            
            return "Please Specify Couse name"
                
        elif tag=="mentor":
            for word in sentence:
                if word in courses:
                    return (f"The mentor for {courses[word]['name']} course is {courses[word][tag]}")
            
            return "Please Specify Couse name"

        if tag=="cost":
            for word in sentence:
                if word in courses:
                    return (f"The cost of {courses[word]['name']} course is {courses[word][tag]}")
    
            return "Please Specify Couse name"
                
        elif tag=="courses":
            res=""
            res+=("Currently, following courses are available :-   ")
            for course in courses:
                res+=courses[course]['name']
                res+=',  '
            return res
        
        else:
            for intent in intents['intents']:
                if tag == intent["tag"]:
                    return random.choice(intent['responses'])
    else:
        return "I do not understand..."
    
if __name__=="__main__":
    print("Let's chat! (type 'quit' to exit)")
    while True:
        # sentence = "do you use credit cards?"
        sentence = input("You: ")
        if sentence == "quit":
            break

        resp = get_response(sentence)
        print(resp)
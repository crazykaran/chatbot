class Chatbox {
    constructor() {
        this.args = {
            openButton: document.querySelector('.chatbox__button'),
            faq: document.querySelector('.faq-button'),
            faqBox: document.querySelector('.chatbox-sidebar'),
            chatBox: document.querySelector('.chatbox__support'),
            sendButton: document.querySelector('.send__button')
        }
        this.faqs = {
            "Suitable for beginner or advanced users ?": "Our courses are designed to be accessible to learners of all levels, ensuring that even beginners can grasp the concepts and progress effectively.",
            "Can I learn at my own pace?": "Our all courses are self-paced, allowing you to learn according to your own schedule.",
            "What type of assignment do you give ?": "You can expect to complete a range of assignments and projects that apply the concepts learned in the course to real-world scenarios.",
            "What are the pre-requirement for this course ?": "There are no prerequisites for enrolling in our courses.",
            "How long does this course take to complete ?": "Please enter name of course.",
            "How much does the course cost ?": "Please enter name of course.",
            "How is the doubt support ?": "We offer robust doubt support for our courses, including access to instructors and online forums.",
            "Does this course offer placement opportunities also ?": "We provide placement assistance to help our students secure job opportunities relevant to the course upon completion.",
            "How is the course different from other platform courses ?": "Our courses stands out from others due to its interactive learning approach, personalized feedback, and practical, real-world projects.",
            "Is there any money back guarantee if I did not like the course ?": "We offer a money-back guarantee if you are not satisfied with the course. Please refer to our refund policy for more details.",
            "Is this course relevant in todays market ?": "Our courses are meticulously crafted to align with the latest industry trends and demands, ensuring that you acquire skills that are highly relevant in today's market.",
            "Is good DSA a prerequisite for this course ?": "There are no prerequisites for enrolling in our courses.",
            "How much I can make after completing this course ?": "Upon completing our courses, individuals often find opportunities for competitive salaries, based on their skills and expertise.",
            "Can I pay in EMI for this course ?": "You can opt for our EMI plan to pay for this course in convenient monthly installments.",
            "Does this course offer financial aid for under-previleged people ?": "Economically Weaker Section (EWS) category students are encouraged to apply for financial aid, as we have provisions in place to support their educational journey.",
            "Does this course offer any certificate ?": "Upon successful completion of our courses, you will receive a certificate to acknowledge your achievement.",
            "Where can I get testimonials for this course ?": "You can find testimonials and reviews for our courses on our website under the 'Testimonials' section.",
            "Who is the mentor for this course ?": "Please specify the course.",
            "Is it an online or offline course ?": "Our course contents are available for online viewing through our platform or downloadable via our app for offline access."
        }


        this.state = false;
        this.faq = false;
        this.messages = [{ name: "Sam", message: "How may I help you!!" }];
    }

    display() {
        const { openButton, chatBox, sendButton, faq, faqBox } = this.args;
        const faqs = this.faqs

        openButton.addEventListener('click', () => this.toggleState(chatBox, faqBox))

        sendButton.addEventListener('click', () => this.onSendButton(chatBox))

        faq.addEventListener('click', () => this.toggleFaq(faqBox, faqs))





        const node = chatBox.querySelector('input');
        node.addEventListener("keyup", ({ key }) => {
            if (key === "Enter") {
                this.onSendButton(chatBox)
            }
        })
    }

    toggleState(chatbox, faqBox) {
        this.state = !this.state;
        if (this.faq) {
            this.faq = false
            faqBox.classList.remove('faq-active')
        }
        // show or hides the box
        if (this.state) {
            chatbox.classList.add('chatbox--active')
            const input = document.querySelector('.input-box');
            input.focus();
        } else {
            chatbox.classList.remove('chatbox--active')
        }
    }

    toggleFaq(faqBox, faqs) {
        this.faq = !this.faq;

        const box = document.querySelector('.chatbox-faqs')
        box.innerHTML = ''
        for (const keys in faqs) {
            const div = document.createElement('div');
            div.classList.add('chatbox-faq');
            div.setAttribute('onClick', `chatbox.setInputField('${keys}')`);
            div.innerText = keys;
            box.append(div)
        }

        // show or hides the box
        if (this.faq) {
            faqBox.classList.add('faq-active')
        } else {
            faqBox.classList.remove('faq-active')
        }
    }

    onSendButton(chatbox) {
        var textField = chatbox.querySelector('input');
        let text1 = textField.value
        if (text1 === "") {
            return;
        }



        let msg1 = { name: "User", message: text1 }
        this.messages.push(msg1);

        // check if question is a FAQ
        if (this.faqs[text1] === undefined) {
            fetch('http://127.0.0.1:5000/predict', {
                method: 'POST',
                body: JSON.stringify({ message: text1 }),
                mode: 'cors',
                headers: {
                    'Content-Type': 'application/json'
                },
            })
                .then(r => r.json())
                .then(r => {
                    if (text1 === "quit") {
                        let msg2 = { name: "Sam", message: r.answer };
                        this.messages.push(msg2);
                        this.updateChatText(chatbox)
                        textField.value = ''
                        this.toggleState(this.args.chatBox, this.args.faqBox)
                    } else {
                        this.faqs[text1] = r.answer;
                        let msg2 = { name: "Sam", message: r.answer };
                        this.messages.push(msg2);
                        this.updateChatText(chatbox)
                        textField.value = ''
                    }

                }).catch((error) => {
                    console.error('Error:', error);
                    this.updateChatText(chatbox)
                    textField.value = ''
                });

        } else {
            let msg3 = { name: "Sam", message: this.faqs[text1] };
            this.messages.push(msg3);
            this.updateChatText(chatbox)
            textField.value = ''
        }
    }

    updateChatText(chatbox) {
        var html = '';

        this.messages.slice().reverse().forEach(function (item, index) {
            if (item.name === "Sam") {
                html += '<div class="messages__item messages__item--visitor">' + item.message + '</div>'
            }
            else {
                html += '<div class="messages__item messages__item--operator">' + item.message + '</div>'
            }
        });




        const chatmessage = chatbox.querySelector('.chatbox__messages');
        const satisfaction = '<div class="satisfaction-level"><span>🙁</span> <span>😐</span> <span>🙂</span></div>'
        chatmessage.innerHTML = satisfaction + html;
        const satisfactionLevel = document.querySelector('.satisfaction-level');

        satisfactionLevel.children[0].addEventListener('click', () => this.satisfaction(0))
        satisfactionLevel.children[1].addEventListener('click', () => this.satisfaction(1))
        satisfactionLevel.children[2].addEventListener('click', () => this.satisfaction(2))
    }
    setInputField(msg) {
        let inputBox = document.querySelector('.input-box');
        inputBox.value = msg;
    }

    satisfaction(response) {
        let message
        if (response === 2) {
            message = "Thanks For Your Feedback!!";
        } else if (response === 0) {
            message = "Sorry for the inconvinience!! Please try asking again."
        } else {
            message = "Please elaborate what you want to ask!!"
        }
        let msg = { name: "Sam", message: message }
        this.messages.push(msg);
        this.updateChatText(this.args.chatBox)
    }
}
const chatbox = new Chatbox();
chatbox.display();
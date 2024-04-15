const conversations = document.querySelector('.conversations');

fetch('/csv_files')
    .then(response => response.json())
    .then(data => {
        for (let i = 0; i < data.length; i++) {
            const url = data[i];
            const temp = url.split('/');
            const filename = temp[temp.length - 1];
            const html = `<img src="static\\images\\chatbot.jpg" class="card-img-top" alt="image"><div class="card-body"><h5 class="card-title">${filename}</h5><p class="card-text">Click here to download this conversation.</p></div>`
            const card = document.createElement('div');
            card.classList.add('card');
            card.style.width = "18rem";
            card.innerHTML = html;
            card.style.cursor = "pointer";
            card.addEventListener('click', function () {
                window.location.href = url;
            });
            conversations.append(card);
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });

const username = "admin";
const password = "admin@123";

function validate() {
    const user = document.getElementById('exampleInput').value;
    const pass = document.getElementById('exampleInputPassword1').value;
    if (username === user && password === pass) {
        const form = document.querySelector('.form');
        form.style.display = "none";
        const conversationContainer = document.querySelector('.conversation-container');
        conversationContainer.style.display = "block";
    } else {
        alert("wrong credentials");
    }
}
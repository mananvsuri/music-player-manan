let currentSong = new Audio();
let songs;
let currFolder;

function formatTime(seconds) {
    if (isNaN(seconds) || seconds < 0) {
        return "00:00"
    }
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = Math.floor(seconds % 60);
    return `${String(minutes).padStart(2, '0')}:${String(remainingSeconds).padStart(2, '0')}`;
}

async function getSongs(folder) {
    currFolder = folder;
    let a = await fetch(`/${folder}/`) 
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }
    }
 

    let songUL = document.querySelector(".songList").getElementsByTagName("ul")[0]
    songUL.innerHTML = ""
    for (const song of songs) {
        songUL.innerHTML = songUL.innerHTML + `<li><img class="invert" width="34" src="img/music.svg" alt="">
                            <div class="info">
                                <div> ${song.replaceAll("%20", " ")}</div>
                                <div>Harry</div>
                            </div>
                            <div class="playnow">
                                <span>Play Now</span>
                                <img class="invert" src="img/play.svg" alt="">
                            </div> </li>`;
    }


    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            playMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })
    })

    return songs
}

const playMusic = (track, pause = false) => {
    currentSong.src = `/${currFolder}/` + track
    if (!pause) {
        currentSong.play()
        play.src = "img/pause.svg"
    }
    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"


}

async function displayAlbums() {
    console.log("displaying albums");
    let a = await fetch(`/songs/`);
    let response = await a.text();
    let div = document.createElement("div");
    div.innerHTML = response;
    let anchors = div.getElementsByTagName("a");
    let cardContainer = document.querySelector(".cardContainer");
    

    cardContainer.innerHTML = "";
    
    let array = Array.from(anchors);
    for (let index = 0; index < array.length; index++) {
        const e = array[index]; 
        if (e.href.includes("/songs") && !e.href.includes(".htaccess")) {
            let folder = e.href.split("/").slice(-2)[0];
            console.log("Found folder:", folder);
            
            try {

                let a = await fetch(`/songs/${folder}/info.json`);
                let response = await a.json(); 
                
                cardContainer.innerHTML += `<div data-folder="${folder}" class="card">
                    <div class="play">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none"
                            xmlns="http://www.w3.org/2000/svg">
                            <path d="M5 20V4L19 12L5 20Z" stroke="#141B34" fill="#000" stroke-width="1.5"
                                stroke-linejoin="round" />
                        </svg>
                    </div>
                    <img src="/songs/${folder}/cover.jpg" alt="">
                    <h2>${response.title}</h2>
                    <p>${response.description}</p>
                </div>`;
            } catch (error) {
                console.error(`Error loading info for folder ${folder}:`, error);
            }
        }
    }


    Array.from(document.getElementsByClassName("card")).forEach(e => { 
        e.addEventListener("click", async item => {
            const folder = item.currentTarget.dataset.folder;
            console.log("Clicked on folder:", folder);
            
            try {
                songs = await getSongs(`songs/${folder}`);
                console.log("Songs retrieved:", songs);
                
                if (songs && songs.length > 0) {
                    console.log("Playing first song:", songs[0]);
                    playMusic(songs[0]);
                } else {
                    console.error("No songs found in folder");
                }
            } catch (error) {
                console.error("Error handling folder click:", error);
            }
        });
    });
}


async function main() {
    await getSongs("songs/bollywood-executives");
    playMusic(songs[0], true);

    displayAlbums();

    play.addEventListener("click", () => {
        if (currentSong.paused) {
            currentSong.play()
            play.src = "img/pause.svg"
        }
        else {
            currentSong.pause()
            play.src = "img/play.svg"
        }
    })


    currentSong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${formatTime(currentSong.currentTime)}/${formatTime(currentSong.duration)}`
        document.querySelector(".circle").style.left = (currentSong.currentTime / currentSong.duration) * 100 + "%";
    })


    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentSong.currentTime = ((currentSong.duration) * percent) / 100;
    })


    document.querySelector(".hamburger").addEventListener("click", () => {
        document.querySelector(".left").style.left = 0;
    })


    document.querySelector(".close").addEventListener("click", () => {
        document.querySelector(".left").style.left = -120 + "%";
    })

    Array.from(document.querySelector(".songList").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {
            document.querySelector(".left").style.left = -120 + "%";
        })
    })


    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0])
        if ((index - 1) >= 0) {
            playMusic(songs[index - 1]);
        }
        else {
            playMusic(songs[songs.length - 1]);
        }
    })


    next.addEventListener("click", () => {
        currentSong.pause();
        let index = songs.indexOf(currentSong.src.split("/").splice(-1)[0])
        if ((index + 1) < songs.length) {
            playMusic(songs[index + 1]);
        }
        else {
            playMusic(songs[0]);
        }
    })


    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {
        console.log("Setting volume to " + e.target.value);
        currentSong.volume = parseInt(e.target.value) / 100
        if (currentSong.volume >0){
            document.querySelector(".volume>img").src = document.querySelector(".volume>img").src.replace("img/mute.svg", "img/volume.svg")
        }
    })


    document.querySelector(".volume > img").addEventListener("click", e=>{
        if(e.target.src.includes("img/volume.svg")){
            e.target.src = "img/mute.svg";
            currentSong.volume = 0;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 0;
        }
        else{
            e.target.src = "img/volume.svg"
            currentSong.volume = 0.1;
            document.querySelector(".range").getElementsByTagName("input")[0].value = 10;
        }
    })
}

main();

const loginBtn = document.querySelector('.loginbtn');
const signupBtn = document.querySelector('.signupbtn');


function createModals() {

    const modalContainer = document.createElement('div');
    modalContainer.className = 'modal-container';
    modalContainer.style.display = 'none';
    

    const loginModalHTML = `
        <div class="auth-modal login-modal">
            <div class="modal-header">
                <h2>Log in to Spotify</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="login-form">
                    <div class="form-group">
                        <label for="login-email">Email or username</label>
                        <input type="text" id="login-email" placeholder="Email or username" required>
                    </div>
                    <div class="form-group">
                        <label for="login-password">Password</label>
                        <input type="password" id="login-password" placeholder="Password" required>
                    </div>
                    <div class="form-check">
                        <input type="checkbox" id="remember-me">
                        <label for="remember-me">Remember me</label>
                    </div>
                    <button type="submit" class="auth-submit-btn">LOG IN</button>
                </form>
                <div class="forgot-password">
                    <a href="#">Forgot your password?</a>
                </div>
                <div class="separator">
                    <span>or</span>
                </div>
                <div class="signup-link">
                    <p>Don't have an account? <a href="#" class="switch-to-signup">Sign up for Spotify</a></p>
                </div>
            </div>
        </div>
    `;
    

    const signupModalHTML = `
        <div class="auth-modal signup-modal">
            <div class="modal-header">
                <h2>Sign up for Spotify</h2>
                <span class="close-modal">&times;</span>
            </div>
            <div class="modal-body">
                <form id="signup-form">
                    <div class="form-group">
                        <label for="signup-email">What's your email?</label>
                        <input type="email" id="signup-email" placeholder="Enter your email" required>
                    </div>
                    <div class="form-group">
                        <label for="signup-password">Create a password</label>
                        <input type="password" id="signup-password" placeholder="Create a password" required>
                    </div>
                    <div class="form-group">
                        <label for="signup-name">What should we call you?</label>
                        <input type="text" id="signup-name" placeholder="Enter a profile name" required>
                    </div>
                    <div class="form-group">
                        <label>Date of birth</label>
                        <div class="dob-inputs">
                            <div>
                                <input type="text" id="signup-day" placeholder="DD" maxlength="2" required>
                                <label for="signup-day">Day</label>
                            </div>
                            <div>
                                <select id="signup-month" required>
                                    <option value="" disabled selected>Month</option>
                                    <option value="01">January</option>
                                    <option value="02">February</option>
                                    <option value="03">March</option>
                                    <option value="04">April</option>
                                    <option value="05">May</option>
                                    <option value="06">June</option>
                                    <option value="07">July</option>
                                    <option value="08">August</option>
                                    <option value="09">September</option>
                                    <option value="10">October</option>
                                    <option value="11">November</option>
                                    <option value="12">December</option>
                                </select>
                                <label for="signup-month">Month</label>
                            </div>
                            <div>
                                <input type="text" id="signup-year" placeholder="YYYY" maxlength="4" required>
                                <label for="signup-year">Year</label>
                            </div>
                        </div>
                    </div>
                    <div class="form-check">
                        <input type="checkbox" id="terms">
                        <label for="terms">I agree to the <a href="#">Spotify Terms and Conditions</a></label>
                    </div>
                    <button type="submit" class="auth-submit-btn">SIGN UP</button>
                </form>
                <div class="login-link">
                    <p>Already have an account? <a href="#" class="switch-to-login">Log in</a></p>
                </div>
            </div>
        </div>
    `;
    

    modalContainer.innerHTML = loginModalHTML + signupModalHTML;
    

    document.body.appendChild(modalContainer);
}


function openLoginModal() {
    const modalContainer = document.querySelector('.modal-container');
    modalContainer.style.display = 'flex';
    document.querySelector('.login-modal').style.display = 'block';
    document.querySelector('.signup-modal').style.display = 'none';
    document.body.style.overflow = 'hidden'; 
}


function openSignupModal() {
    const modalContainer = document.querySelector('.modal-container');
    modalContainer.style.display = 'flex';
    document.querySelector('.signup-modal').style.display = 'block';
    document.querySelector('.login-modal').style.display = 'none';
    document.body.style.overflow = 'hidden'; 
}


function closeModal() {
    const modalContainer = document.querySelector('.modal-container');
    modalContainer.style.display = 'none';
    document.body.style.overflow = 'auto'; 
}


function setupModalEvents() {

    loginBtn.addEventListener('click', openLoginModal);
    signupBtn.addEventListener('click', openSignupModal);

    document.querySelectorAll('.close-modal').forEach(button => {
        button.addEventListener('click', closeModal);
    });

    document.querySelector('.switch-to-signup').addEventListener('click', function (e) {
        e.preventDefault();
        openSignupModal();
    });

    document.querySelector('.switch-to-login').addEventListener('click', function (e) {
        e.preventDefault();
        openLoginModal();
    });

    document.querySelector('.modal-container').addEventListener('click', function (e) {
        if (e.target === this) {
            closeModal();
        }
    });

    // ✅ Login Form Validation
    document.getElementById('login-form').addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('login-email').value.trim();
        const password = document.getElementById('login-password').value.trim();

        // Basic validation
        if (!email || !password) {
            alert("Please enter both email and password");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password })
            });

            const data = await response.text();
            alert(data);
            closeModal();
        } catch (error) {
            console.error("Login Error:", error);
        }
    });

    // ✅ Signup Form Validation
    document.getElementById('signup-form').addEventListener('submit', async function (e) {
        e.preventDefault();

        const email = document.getElementById('signup-email').value.trim();
        const password = document.getElementById('signup-password').value.trim();
        const name = document.getElementById('signup-name').value.trim();
        const day = document.getElementById('signup-day').value.trim();
        const month = document.getElementById('signup-month').value;
        const year = document.getElementById('signup-year').value.trim();
        const termsAccepted = document.getElementById('terms').checked;

        // Validation Checks
        if (!email || !/^\S+@\S+\.\S+$/.test(email)) {
            alert("Enter a valid email address");
            return;
        }

        if (password.length < 6) {
            alert("Password must be at least 6 characters long");
            return;
        }

        if (!name) {
            alert("Please enter a profile name");
            return;
        }

        if (!day || !month || !year || isNaN(day) || isNaN(year) || parseInt(day) > 31 || parseInt(day) < 1 || parseInt(year) > new Date().getFullYear()) {
            alert("Enter a valid date of birth");
            return;
        }

        if (!termsAccepted) {
            alert("You must accept the terms and conditions");
            return;
        }

        try {
            const response = await fetch('http://localhost:3000/signup', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ email, password, name })
            });

            const data = await response.text();
            alert(data);
            closeModal();
        } catch (error) {
            console.error("Signup Error:", error);
        }
    });
}


function initModals() {
    createModals();
    setupModalEvents();
}


document.addEventListener('DOMContentLoaded', function() {
    initModals();
});


if (document.readyState === 'complete' || document.readyState === 'interactive') {
    initModals();
}

function createUserLogo(name) {
    const buttonsContainer = document.querySelector('.buttons');
    buttonsContainer.innerHTML = ''; // Clear existing buttons
    
    const userLogo = document.createElement('div');
    userLogo.className = 'user-logo';
    userLogo.textContent = name.charAt(0).toUpperCase();
    userLogo.style.cssText = `
        width: 40px;
        height: 40px;
        background-color: #1DB954;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: white;
        font-weight: bold;
        cursor: pointer;
    `;
    
    buttonsContainer.appendChild(userLogo);
}

function handleSuccessfulLogin(username) {
    // Store the username in localStorage
    localStorage.setItem('spotifyUsername', username);
    
    // Create and display the user logo
    createUserLogo(username);
    
    // Close the modal
    closeModal();
}

// Modify the existing login form submission
document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const username = document.getElementById('login-email').value;
            handleSuccessfulLogin(username);
        });
    }
    
    // Check if user is already logged in
    const storedUsername = localStorage.getItem('spotifyUsername');
    if (storedUsername) {
        createUserLogo(storedUsername);
    }
});

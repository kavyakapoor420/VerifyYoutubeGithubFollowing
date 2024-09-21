const googleBtn=document.getElementById("google-btn")

const githubBtn=document.getElementById("github-btn")

githubBtn.addEventListener("click",()=>{
    window.location.href='/auth/github'
})

googleBtn.addEventListener('click',()=>{
    window.location.href='/auth/google'
})

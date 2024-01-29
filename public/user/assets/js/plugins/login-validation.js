const emailid = document.getElementById('logEmail');
const passid = document.getElementById('logPassword');
const error5 = document.getElementById('error5');
const error6 = document.getElementById('error6');
const logform = document.getElementById('loginform')

function emailvalidate(e){
    const emailval = emailid.value
    const emailpattern = /^([a-zA-Z0-9._-]+)@([a-zA-Z.-]+).([a-zA-z]{2,4})$/ 
    if(!emailpattern.test(emailval))
    {    
        error5.style.display = "block"
        error5.innerHTML = "Invalid Format!!"
    }
    else{
        error5.style.display = "none"
        error5.innerHTML = ""
    }
}
function passvalidate(e){
    const passval = passid.value
    const alpha = /[a-zA-Z]/
    const digit = /\d/
    if(passval.length < 8)
    {   
        error6.style.display = "block"
        error6.innerHTML = "Must have atleast 8 characters"
    }
    else if(!alpha.test(passval) || !digit.test(passval) )
    {
        error6.style.display = "block"
        error6.innerHTML = "Should contain Numbers and Alphabets!!"
    }
    else{

        error6.style.display = "none"
        error6.innerHTML = ""
    }
}


emailid.addEventListener('blur', emailvalidate)
passid.addEventListener('blur',passvalidate)

logform.addEventListener('submit',function(e){
    emailvalidate()
    passvalidate()
    
    if(error5.innerHTML || error6.innerHTML )
    {
        e.preventDefault()
    }
})

const emailid = document.getElementById('logEmail');
const passid = document.getElementById('logPassword');
const error1 = document.getElementById('error1');
const error2 = document.getElementById('error2');
const logform = document.getElementById('loginform')

function emailvalidate(e){
    const emailval = emailid.value
    const emailpattern = /^([a-zA-Z0-9._-]+)@([a-zA-Z.-]+).([a-zA-z]{2,4})$/ 
    if(!emailpattern.test(emailval))
    {    
        error1.style.display = "block"
        error1.innerHTML = "Invalid Format!!"
    }
    else{
        error1.style.display = "none"
        error1.innerHTML = ""
    }
}
function passvalidate(e){
    const passval = passid.value
    const alpha = /[a-zA-Z]/
    const digit = /\d/
    if(passval.length < 8)
    {   
        error2.style.display = "block"
        error2.innerHTML = "Must have atleast 8 characters"
    }
    else if(!alpha.test(passval) || !digit.test(passval) )
    {
        error2.style.display = "block"
        error2.innerHTML = "Should contain Numbers and Alphabets!!"
    }
    else{

        error2.style.display = "none"
        error2.innerHTML = ""
    }
}


emailid.addEventListener('blur', emailvalidate)
passid.addEventListener('blur',passvalidate)

logform.addEventListener('submit',function(e){
    emailvalidate()
    passvalidate()
    
    if(error1.innerHTML || error2.innerHTML )
    {
        e.preventDefault()
    }
})

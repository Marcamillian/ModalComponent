// accessibility guidelines - https://www.w3.org/TR/wai-aria-practices-1.1/#alertdialog

const template = document.createElement('template')
template.innerHTML = `
<style>
  :host{
    position: fixed;
    left:0px;
    right:0px;

    background-color: #000000cc;
    background-size:auto;
    background-repeat:no-repeat; 
    background-position:center;

    color:white;
    text-align:center;

    flex-direction:column;
    align-items:center;
    
    z-index: 1;
  }
  :host(.hide){
    display:none;
  }
  
  .modal-container{
    
    flex-direction:inherit;
    width:90%;
    padding: 1em 5%;

    z-index:1;
   
    background-color:inherit;
    background-image:inherit;
    background-size:inherit;
    background-repeat:inherit;
    background-position:center;
    color:inherit; 
  }

  .overlay{
    position:fixed;
    top:0px;
    left:0px;
    right:0px;
    bottom:0px;
    z-index:-1; 

    background-color:#000000aa;
   
  }
  :host(.hide) .overlay{
    display:none;
  }


</style>
<div class="modal-container">
  <slot></slot>
</div>
<div class="overlay"></div>`


export default class MyModal extends HTMLElement{

  constructor(){
    super()

    this.focusedElementBeforeModal = null;
    this.firstTabStop = null;
    this.lastTabStop = null;
    this.overlay = null;
  }

  connectedCallback(){
    let shadowRoot = this.attachShadow({mode:'open'})

    // clone the template
    let instance = template.content.cloneNode(true)
    shadowRoot.appendChild(instance)

    this.overlay = shadowRoot.querySelector('.overlay')

    this.setAttribute("role", "dialog")
    this.setAttribute("aria-modal", "true")
    if(!this.getAttribute("aria-label")) this.setAttribute('aria-label', "Alert Modal")

    // set event listener for tabbing
    this.addEventListener('keydown', this.trappedKeyboardHandler )
    this.classList.add('hide');

  }

  animations = {
    "slideTop":(distance)=>{
      return [
        { top: `${distance}px` },
        { top: '0px' },
      ]
    },
    "fadeIn":[
      {opacity: '0'},
      {opacity: '1'}
    ]
  }

  open(){
    // make modal visible
    this.classList.remove('hide')
    // move modal into view
    this.animate( this.animations.slideTop(-( this.clientHeight + 10 )),
      {
        duration: 1000,
        fill:"forwards",
        easing:'ease-in-out'
      }
    )
    // fade in the overlay
    this.overlay.animate( this.animations.fadeIn,
      {
        duration: 200,
        fill: 'forwards',
        easing:'ease-in-out'
      }
    )

    this.enterKeyboardTrap();    
  }

  close(){
    // slide modal out of view
    this.animate( this.animations.slideTop(-( this.clientHeight + 10 )),
      {
        direction:'reverse',
        duration: 1000,
        fill: 'forwards',
        easing:'ease-in-out'
      }
    )
    //hide modal once out of view
    .onfinish = ()=>{
      this.classList.add('hide')
    }
    
    // fade out overlay
    this.overlay.animate(this.animations.fadeIn,
      {
        direction:'reverse',
        duration: 200,
        fill: 'forwards',
        easing:'ease-in-out'
      }
    )

    this.exitKeyboardTrap();
  }

  trappedKeyboardHandler(event){
    switch(event.keyCode){
      case 9:  // handle tab
        
        if(event.shiftKey){
          if( document.activeElement === this.firstTabStop){
            event.preventDefault()
            this.lastTabStop.focus()
          }
        }else{
          if(document.activeElement == this.lastTabStop){
            event.preventDefault();
            this.firstTabStop.focus()
          }
        }
          
      break;
      case 27:  // handle shift/tab
        this.close()
      break;
    }
  }

  // set up the keyboard trap
  enterKeyboardTrap(){

    // store the pre-modal focused element
    this.focusedElementBeforeModal = document.activeElement;

    // find focusable elements in modal
    const focusableSelectorString = 'a[href], area[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), button:not([disabled]), iframe, object, embed, [tabindex="0"], [contenteditable]';
    const focusableElements = [...this.querySelectorAll(focusableSelectorString)]

    this.firstTabStop = focusableElements[0];
    this.lastTabStop = focusableElements[ focusableElements.length -1]

    this.firstTabStop.focus();

  }

  // clear the keyboard trap
  exitKeyboardTrap(){
    if(this.focusedElementBeforeModal) this.focusedElementBeforeModal.focus();
  }

}
import {select, classNames, templates, settings} from '../settings.js';
import utils from '../utils.js';
import CartProduct from './CartProduct.js';


class Cart{
  constructor(element){
    const thisCart = this;

    thisCart.products = [];

    thisCart.getElements(element);
    thisCart.initActions();


    
    //console.log('new Cart: ', thisCart);
  }

  getElements(element){
    const thisCart = this;

    thisCart.dom = {};


    thisCart.dom.wrapper = element;
    thisCart.dom.toggleTrigger = thisCart.dom.wrapper.querySelector(select.cart.toggleTrigger);

    thisCart.dom.productList = thisCart.dom.wrapper.querySelector(select.cart.productList);

    thisCart.dom.deliveryFee = thisCart.dom.wrapper.querySelector(select.cart.deliveryFee);
    thisCart.dom.subtotalPrice = thisCart.dom.wrapper.querySelector(select.cart.subtotalPrice);
    thisCart.dom.totalPrice = thisCart.dom.wrapper.querySelector(select.cart.totalPrice);
    thisCart.dom.totalNumber = thisCart.dom.wrapper.querySelector(select.cart.totalNumber);
    thisCart.dom.total = thisCart.dom.wrapper.querySelector(select.cart.total);

    thisCart.dom.form = thisCart.dom.wrapper.querySelector(select.cart.form);
    thisCart.dom.address = thisCart.dom.wrapper.querySelector(select.cart.address);
    thisCart.dom.phone = thisCart.dom.wrapper.querySelector(select.cart.phone);



  }

  initActions(){
    const thisCart = this;

    thisCart.dom.toggleTrigger.addEventListener('click', function(){
      thisCart.dom.wrapper.classList.toggle(classNames.cart.wrapperActive);
    });

    thisCart.dom.productList.addEventListener('updated', function(){
      thisCart.update();
    });

    thisCart.dom.productList.addEventListener('remove', function(event){
      thisCart.remove(event.detail.cartProduct);
      //console.log('event: ', event);
    });

    thisCart.dom.form.addEventListener('submit', function(event){
      event.preventDefault();
      thisCart.sendOrder();
    });

  }

  add(menuProduct){
    const thisCart = this;

    const generatedHTML = templates.cartProduct(menuProduct); //??

    const createdDOM = utils.createDOMFromHTML(generatedHTML);

    thisCart.dom.productList.appendChild(createdDOM);


    thisCart.products.push(new CartProduct(menuProduct, createdDOM));
    //console.log('thisCart.products: ', thisCart.products);

    //console.log('adding product: ', menuProduct);

    //console.log('createdDOM: ', createdDOM);

    thisCart.update();
  }

  update(){
    const thisCart = this;

    const deliveryFee = settings.cart.defaultDeliveryFee;

    thisCart.totalNumber = 0;
    thisCart.subtotalPrice = 0;

    for(let thisCartProduct of thisCart.products) {
      thisCart.totalNumber += thisCartProduct.amountWidget.value;
      thisCart.subtotalPrice += thisCartProduct.price;
    }

    thisCart.totalPrice = thisCart.subtotalPrice;
    if(thisCart.subtotalPrice != 0) {
      thisCart.totalPrice = thisCart.subtotalPrice + deliveryFee;
    }

    console.log('thisCart.dom: ', thisCart.dom);
    

    thisCart.dom.deliveryFee.innerHTML = deliveryFee;
    thisCart.dom.subtotalPrice.innerHTML = thisCart.subtotalPrice;
    thisCart.dom.totalPrice.innerHTML = thisCart.totalPrice;
    thisCart.dom.totalNumber.innerHTML = thisCart.totalNumber;
    thisCart.dom.total.innerHTML = thisCart.totalPrice;

    if(thisCart.subtotalPrice == 0) {
      thisCart.dom.deliveryFee.innerHTML = 0;
    }

    // console.log('totalNumber: ', totalNumber);
    // console.log('subtotalPrice: ', subtotalPrice);
    // console.log('thisCart.totalPrice: ', thisCart.totalPrice);
  }

  remove(detail){

    const thisCart = this;
    console.log('detail: ', detail);

    console.log('thisCart.products: ', thisCart.products);

    detail.dom.wrapper.remove();

    //const removedHTML = thisCart.products.detail
    //removedHTML.remove();

    //let productSelector = thisCart.dom.productList.detail;

    //const galleryDiv = document.querySelector(productSelector);
    //galleryDiv.remove();

    console.log('thisCart.dom.productList: ', thisCart.dom.productList);


    //const removingObject = thisCart.products.detail.id;
    let startAtIndex = thisCart.products.indexOf(detail);
    thisCart.products.splice(startAtIndex, 1);

    thisCart.update();

  }

  sendOrder(){
    const thisCart = this;

    const url = settings.db.url + '/' + settings.db.orders;

    let payload = {
      address: thisCart.dom.address.value,
      phone: thisCart.dom.phone.value,
      totalPrice: thisCart.price,
      subtotalPrice: thisCart.subtotalPrice,
      totalNumber: thisCart.totalNumber,
      deliveryFee: thisCart.price - thisCart.subtotalPrice,
      products: []
    };

    for(let prod of thisCart.products) {
      payload.products.push(prod.getData());
    }

    const options = {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(payload),
    };
    
    fetch(url, options);

    console.log('payload: ', payload);

  }
  
}

export default Cart;
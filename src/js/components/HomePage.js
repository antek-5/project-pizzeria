import { templates, select } from "../settings.js";


class HomePage{

    constructor(){
        const thisHomePage = this;

        thisHomePage.render();
        thisHomePage.initWidgets();
    }

    render(){
        //const thisHomePage = this;

        const generatedHTML = templates.homePage();
        const homePageContainer = document.querySelector(select.containerOf.homePage);

   

        homePageContainer.innerHTML = generatedHTML;

    }

    initWidgets(){

    }

}

export default HomePage;
import { templates, select, settings, classNames } from '../settings.js';
import utils from '../utils.js';
import AmountWidget from './AmountWidget.js';
import DatePicker from './DatePicker.js';
import HourPicker from './HourPicker.js';


class Booking{
    constructor(element){
        const thisBooking = this;

        //selecting tables
        thisBooking.selectedTable = {};

        thisBooking.render(element);
        thisBooking.initWidgets();
        thisBooking.getData();

        thisBooking.dom.submitButton.addEventListener('click', function(event){
            event.preventDefault();
            thisBooking.sendBooking();
        })
    }

    getData(){
        const thisBooking = this;

        const startDateParam = settings.db.dateStartParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.minDate);
        const endDateParam = settings.db.dateEndParamKey + '=' + utils.dateToStr(thisBooking.datePickerWidget.maxDate);

        const params = {
            booking: [
                startDateParam,
                endDateParam,
            ],
            eventsCurrent: [
                settings.db.notRepeatParam,
                startDateParam,
                endDateParam,
            ],
            eventsRepeat: [
                settings.db.repeatParam,
                endDateParam,
            ],
        };

        //console.log('params', params);

        const urls = {
            booking:        settings.db.url + '/' + settings.db.bookings
                                            + '?' + params.booking.join('&'),

            eventsCurrent:  settings.db.url + '/' + settings.db.events  
                                            + '?' + params.eventsCurrent.join('&'),

            eventsRepeat:   settings.db.url + '/' + settings.db.events  
                                            + '?' + params.eventsRepeat.join('&'),
        };

        Promise.all([
            fetch(urls.booking),
            fetch(urls.eventsCurrent),
            fetch(urls.eventsRepeat),
        ])
            .then(function(allResponses){
                const bookingsResponse = allResponses[0];
                const eventsCurrentResponse = allResponses[1];
                const eventsRepeatResponse = allResponses[2];
                return Promise.all([
                    bookingsResponse.json(),
                    eventsCurrentResponse.json(),
                    eventsRepeatResponse.json(),
                ]);
            })
            .then(function([bookings, eventsCurrent, eventsRepeat]){
                // console.log('bookings', bookings);
                // console.log('eventsCurrnet', eventsCurrent);
                // console.log('eventsRepeat', eventsRepeat);

                thisBooking.parseData(bookings, eventsCurrent, eventsRepeat);
            })

    }

    parseData(bookings, eventsCurrent, eventsRepeat){
        const thisBooking = this;

        //console.log('eventsCurrent', eventsCurrent);

        thisBooking.booked = {};

        for(let item of bookings){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        for(let item of eventsCurrent){
            thisBooking.makeBooked(item.date, item.hour, item.duration, item.table);
        }

        const minDate = thisBooking.datePickerWidget.minDate;
        const maxDate = thisBooking.datePickerWidget.maxDate;

        for(let item of eventsRepeat){
            if(item.repeat == 'daily'){
                for(let loopDate = minDate; loopDate <= maxDate; loopDate = utils.addDays(loopDate, 1)){
                    thisBooking.makeBooked(utils.dateToStr(loopDate), item.hour, item.duration, item.table);
                }

            }
        }

        

        //console.log('thisBooking.booked', thisBooking.booked);

        thisBooking.updateDOM();

    }

    makeBooked(date, hour, duration, table){
        const thisBooking = this;

        if(typeof thisBooking.booked[date] == 'undefined'){
            thisBooking.booked[date] = {};
        }

        const startHour = utils.hourToNumber(hour);

        for(let hourBlock = startHour; hourBlock < startHour + duration; hourBlock += 0.5){
            if(typeof thisBooking.booked[hourBlock] == 'undefined'){
                thisBooking.booked[date][hourBlock] = [];
            }
            thisBooking.booked[date][hourBlock].push(table);
        }
    }

    updateDOM(){
        const thisBooking = this;

        thisBooking.date = thisBooking.datePickerWidget.value;
        thisBooking.hour = utils.hourToNumber(thisBooking.hourPickerWidget.value);

        let allAvailable = false;

        if(
            typeof thisBooking.booked[thisBooking.date] == 'undefined'
            ||
            typeof thisBooking.booked[thisBooking.date][thisBooking.hour] == 'undefined'
        ){
            allAvailable = true;
        }

        //console.log('thisBooking.dom', thisBooking.dom);
        //console.log('thisBooking.dom.tables', thisBooking.dom.tables);
        for(let table of thisBooking.dom.tables){
            let tableId = table.getAttribute(settings.booking.tableIdAttribute);
            if(!isNaN(tableId)){
                tableId = parseInt(tableId);
            }

            if(
                !allAvailable
                &&
                thisBooking.booked[thisBooking.date][thisBooking.hour].includes(tableId) > -1
            ){
                table.classList.add(classNames.booking.tableBooked);
            } else {
                table.classList.remove(classNames.booking.tableBooked);
            }
        }
    }

    render(wrapper){
        const thisBooking = this;

        const generatedHTML = templates.bookingWidget();


        thisBooking.dom = {};
        thisBooking.dom.wrapper = wrapper;
        thisBooking.dom.wrapper.innerHTML = generatedHTML;

        thisBooking.dom.peopleAmount = thisBooking.dom.wrapper.querySelector(select.booking.peopleAmount);
        thisBooking.dom.hoursAmount = thisBooking.dom.wrapper.querySelector(select.booking.hoursAmount);

        thisBooking.dom.datePicker = thisBooking.dom.wrapper.querySelector(select.widgets.datePicker.wrapper);
        thisBooking.dom.hourPicker = thisBooking.dom.wrapper.querySelector(select.widgets.hourPicker.wrapper);

        thisBooking.dom.tables = thisBooking.dom.wrapper.querySelectorAll(select.booking.tables);

        thisBooking.dom.floorPlan = thisBooking.dom.wrapper.querySelector(select.booking.floorPlan);

        thisBooking.dom.submitButton = thisBooking.dom.wrapper.querySelector(select.booking.submitButton);

        thisBooking.dom.address = thisBooking.dom.wrapper.querySelector(select.booking.address);
        thisBooking.dom.phone = thisBooking.dom.wrapper.querySelector(select.booking.phone);

        thisBooking.dom.starterChecked = thisBooking.dom.wrapper.querySelectorAll(select.booking.startersChecked);
        
    }

    initWidgets(){
        const thisBooking = this;

        thisBooking.peopleAmountWidget = new AmountWidget(thisBooking.dom.peopleAmount);
        thisBooking.hoursAmountWidget = new AmountWidget(thisBooking.dom.hoursAmount);

        thisBooking.datePickerWidget = new DatePicker(thisBooking.dom.datePicker);
        thisBooking.hourPickerWidget = new HourPicker(thisBooking.dom.hourPicker);

        thisBooking.dom.wrapper.addEventListener('updated', function(){
            thisBooking.updateDOM();
            thisBooking.resetTables();
        })

        thisBooking.dom.floorPlan.addEventListener('click', function(event){
            thisBooking.initTables(event);
        })
        
    }

    initTables(event){
        const thisBooking = this;

        if(event.target.classList.contains('table')){

            if(event.target.classList.contains('booked')){

                console.log('this table is already booked!');

            } else {
                const dataTable = event.target.getAttribute('data-table');

                if(event.target.classList.contains('selected')){
                    event.target.classList.remove('selected');
                } else {
                    event.target.classList.add('selected');
                    thisBooking.selectedTable.dataTable = dataTable;
                }

            }

        }

    }

    resetTables(){
        const thisBooking = this;

        for(let table of thisBooking.dom.tables){
            table.classList.remove('selected');
        }
        thisBooking.selectedTable.dataTable = 'not-selected';
        this.updateDOM();

    }

    sendBooking(){

        const thisBooking = this;

        const url = settings.db.url + '/' + settings.db.bookings;


        const durationInput = thisBooking.dom.hoursAmount.querySelector('.amount');
        const duration = durationInput.value;

        const peopleAmountInput = thisBooking.dom.peopleAmount.querySelector('.amount');
        const peopleAmount = peopleAmountInput.value;



        let startersArray = [];
        
        const startersCheckedInput = thisBooking.dom.starterChecked;

        for(let input of startersCheckedInput){
            if(input.checked){
                startersArray.push(input.value);
                console.log('pushed');
            }
        }

 


        let payload = 
        {
            "date": thisBooking.datePickerWidget.correctValue, //data wybrana w datePickerze
            "hour": thisBooking.hourPickerWidget.correctValue, //godzina wybrana w hourPickerze (w formacie HH:ss)
            "table": thisBooking.selectedTable.dataTable, //numer wybranego stolika (lub null jeśli nic nie wybrano)

            "duration": duration, //liczba godzin wybrana przez klienta
            "ppl": peopleAmount, //liczba osób wybrana przez klienta

            "starters": startersArray,

            "phone": thisBooking.dom.phone.value, //numer telefonu z formularza,
            "address": thisBooking.dom.address.value, //adres z formularza
        }


        const options = {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        };

        fetch(url, options);

        thisBooking.makeBooked(payload.date, payload.hour, payload.duration, payload.table);
        
        console.log('payload: ', payload);


    }

}

export default Booking;
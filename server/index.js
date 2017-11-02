const Alexa = require('alexa-sdk');

const languageStrings = {
  en: {
    translation: {
      WELCOME: "Welcome to Gloucester Guide!",
      HELP: "Say about, to hear more about the city, or say coffee, breakfast, lunch, or dinner, to hear local restaurant suggestions, or say recommend an attraction, or say, go outside. ",
      ABOUT: "Gloucester Massachusetts is a city on the Atlantic Ocean.  A popular summer beach destination, Gloucester has a rich history of fishing and ship building.",
      STOP: "Okay, see you next time!"
    }
  }
};

const data = {
  restaurants: [
    {
      name: "Zeke's Place",
      address:"66 East Main Street", "phone": "978-283-0474",
      meals: "breakfast, lunch",
      description: "A cozy and popular spot for breakfast.  Try the blueberry french toast!"
    }
  ]
};

const SKILL_NAME = "Cocktail Guide";
const myAPI = {
    host: 'query.yahooapis.com',
    port: 443,
    path: `/v1/public/yql?q=select%20*%20from%20weather.forecast%20where%20woeid%20in%20(select%20woeid%20from%20geo.places(1)%20where%20text%3D%22${encodeURIComponent(data.city)}%2C%20${data.state}%22)&format=json&env=store%3A%2F%2Fdatatables.org%2Falltableswithkeys`,
    method: 'GET'
};

exports.handler = function(event, context, callback) {
  const alexa = Alexa.handler(event, context);

  alexa.resources = languageStrings;
  alexa.registerHandlers(handlers);
  alexa.execute();
};

const handlers = {
  LaunchRequest: function () {
    const say = this.t('WELCOME') + ' ' + this.t('HELP');
    this.response.speak(say).listen(say);
    this.emit(':responseReady');
  },

  AboutIntent: function () {
      this.response.speak(this.t('ABOUT'));
      this.emit(':responseReady');
  },

  'AMAZON.YesIntent': function () {
    const restaurantName = this.attributes['restaurant'];
    const restaurantDetails = getRestaurantByName(restaurantName);

    const say = restaurantDetails.name
        + ' is located at ' + restaurantDetails.address
        + ', the phone number is ' + restaurantDetails.phone
        + ', and the description is, ' + restaurantDetails.description
        + '  I have sent these details to the Alexa App on your phone.  Enjoy your meal! <say-as interpret-as="interjection">bon appetit</say-as>' ;

    const card = restaurantDetails.name + '\n' + restaurantDetails.address + '\n'
        + data.city + ', ' + data.state + ' ' + data.postcode
        + '\nphone: ' + restaurantDetails.phone + '\n';

    this.response.cardRenderer(SKILL_NAME, card);
    this.response.speak(say);
    this.emit(':responseReady');

  },

  'GoOutIntent': function () {
    getWeather( ( localTime, currentTemp, currentCondition) => {
      const say = 'It is ' + localTime
          + ' and the weather in ' + data.city
          + ' is '
          + currentTemp + ' and ' + currentCondition;
      this.response.speak(say);
      this.emit(':responseReady');
    });
  },

  'AMAZON.NoIntent': function () {
      this.emit('AMAZON.StopIntent');
  },

  'AMAZON.HelpIntent': function () {
      this.response.speak(this.t('HELP')).listen(this.t('HELP'));
      this.emit(':responseReady');
  },

  'AMAZON.CancelIntent': function () {
      this.response.speak(this.t('STOP'));
      this.emit(':responseReady');
  },

  'AMAZON.StopIntent': function () {
      this.emit('SessionEndedRequest');
  },

  'SessionEndedRequest': function () {
      this.response.speak(this.t('STOP'));
      this.emit(':responseReady');
  }
};

function getRestaurantsByMeal(mealtype) {
    const list = [];
    for (const i = 0; i < data.restaurants.length; i++) {

        if(data.restaurants[i].meals.search(mealtype) >  -1) {
            list.push(data.restaurants[i]);
        }
    }
    return list;
}

function getRestaurantByName(restaurantName) {
  const restaurant = {};

  for (const i = 0; i < data.restaurants.length; i++) {
    if (data.restaurants[i].name == restaurantName) {
        restaurant = data.restaurants[i];
    }
  }

  return restaurant;
}

function getWeather(callback) {
  const https = require('https');

  const req = https.request(myAPI, res => {
    const returnData = '';

    res.setEncoding('utf8');
    res.on('data', chunk => {
      returnData = returnData + chunk;
    });

    res.on('end', () => {
      const channelObj = JSON.parse(returnData).query.results.channel;
      const localTime = channelObj.lastBuildDate.toString();

      localTime = localTime.substring(17, 25).trim();

      const currentTemp = channelObj.item.condition.temp;
      const currentCondition = channelObj.item.condition.text;

      callback(localTime, currentTemp, currentCondition);
    });
  });

  req.end();
}

function randomArrayElement(array) {
  const i = 0;

  i = Math.floor(Math.random() * array.length);

  return(array[i]);
}

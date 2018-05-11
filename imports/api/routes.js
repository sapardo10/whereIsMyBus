import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Routes = new Mongo.Collection('routes');

if (Meteor.isServer) {
  // This code only runs on the server

  Meteor.publish('routes', function routesPublication() {

    return Routes.find({});

  });

}

Meteor.methods({

  	'routes.insert'(route) {

	    check(text, String);
	    console.log('ingreso '+ text);
	    Routes.insert({
	    	route:route,
        comments:[]
	    });

    },

    'routes.comment'(idRoute, comment) {
      check(idRoute, String);
      check(comment, String);

      var route = Routes.find({
        _id:idRoute
      });
    }



 });
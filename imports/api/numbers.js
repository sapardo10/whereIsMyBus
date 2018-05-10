import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Numbers = new Mongo.Collection('numbers');

if (Meteor.isServer) {

  // This code only runs on the server

  Meteor.publish('tasks', function tasksPublication() {

    return Tasks.find();

  });

}

Meteor.methods({

  	'numbers.insert'(text) {

	    check(text, String);
	    console.log('ingreso '+ text);
	    Numbers.insert({
	    	number:text
	    });

    }


 });
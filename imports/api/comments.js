import { Meteor } from 'meteor/meteor';
import { Mongo } from 'meteor/mongo';
import { check } from 'meteor/check';

export const Comments = new Mongo.Collection('comments');

if (Meteor.isServer) {
  // This code only runs on the server

  Meteor.publish('comments', function commentsPublication() {

    return Comments.find({});

  });

}

Meteor.methods({
  	'comments.insert'(comment, route) {
      console.log(comment);
	    Comments.insert({
	    	route:route,
        comment:comment,
        createdAt: new Date(),
        owner: this.userId,
        username: Meteor.users.findOne(this.userId).username,
	    });

    }

 });
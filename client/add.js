Template.add.events({
    'submit': function(e){
        e.preventDefault();
        Session.set("formMessage", "Dank je wel!");
        Meteor.setTimeout(function() {
            Session.set("formMessage", null);
        }, 5000);
        var score = parseInt($("[name=score]").val());
        var player = $("[name=name]").val();
        Scores.insert({
            score: score,
            player: player,
            date: new Date()
        });
        $('input').val("");
    }
});

Template.add.helpers({
    message: function(){
        return Session.get("formMessage");
    },
    messageClass: function(){
        return Session.get("formMessage") ? "active" : null;
    }
});
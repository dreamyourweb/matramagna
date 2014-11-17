Meteor.methods({
    clearScores: function(){
        Scores.remove({});
    }
});
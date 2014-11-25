/**
 * Created by niklas on 25.11.14.
 */

var Twitter = Meteor.npmRequire("twitter");
var twit = new Twitter({
    consumer_key: 'ro52EZOK70IYOjMh4TH66HHbi',
    consumer_secret: '0xTUzkRqj9RFT7iEnyfwJADQPUH4Rw5iLxvF7H2SV083fvJOYz',
    access_token_key: '2891937016-2TQh8xabSa9J7eOxZbV9aC3Mlt2WF65IYwsVt2p',
    access_token_secret: 'VAFDIevmn81mcMpPoBSsYkvRaiEsFvfMHJbSMSMkwZxdf'
});

function normalize_text(text){
    return text.replace(",", "").replace(".", "")
}

function extract_score(text) {
    // maybe they used "," or "." to indicate decimal points. remove these:
    text = normalize_text(text);
    var re = /[0-9]+/;
    var matched = re.exec(text);
    return matched;
}

twit.stream('filter', {track:'#orikami #highscore'}, function(stream) {
    stream.on('data', Meteor.bindEnvironment(function (data) {
        console.log(data);
        console.log('hey, data! :)')
        // extract the data we want:
        // name is easy
        var name = data.user.name;
        // highscore needs to be pulled from the text
        var text = data.text;
        var matched = extract_score(text);
        if (!(matched === null)) {
            var nr = parseInt(matched[0]);
            console.log("found number " + nr);
            console.log("found name "+ name);
            Scores.insert(
                {
                    player: name,
                    score: nr,
                    date: new Date()
                }
            )
        } else {
            console.log("No number found in tweet")
        }
    }));
});
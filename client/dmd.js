
Template.dmd.rendered = function(){
    var camera, scene, renderer, composer;
            var object, light;
            var scores = Scores.find({},{sort: {date: -1}, limit: 4});
            var highScores = Scores.find({},{sort: {score: -1}, limit: 1});
            var material;
            var scoresObjectPositionY = 0;
            var scoresRenderd = 0;

            init();
            animate();

            function init() {

                renderer = new THREE.WebGLRenderer({antialias: true});
                var cols = 256;
                var aspect = window.innerWidth / window.innerHeight;
                renderer.setSize( window.innerWidth, window.innerHeight );
                renderer.autoClear = false;
                document.body.appendChild( renderer.domElement );

                //

                camera = new THREE.PerspectiveCamera( 40, aspect, 1, 100000 );
                camera.position.z = 500;

                scene = new THREE.Scene();
                // scene.fog = new THREE.Fog( 0x000000, 1, 1000 );

                scoresObject = new THREE.Object3D();
                // highScoresObject = new THREE.Object3D();
                scene.add( scoresObject );
                // scene.add(highScoresObject);

                // var geometry = new THREE.SphereGeometry( 1, 4, 4 );
                material = new THREE.MeshPhongMaterial( { color: 0xffffff, shading: THREE.FlatShading } );
            
                

                scoresObject.position.set(0,0,-1000);

                scene.add( new THREE.AmbientLight( 0x999999 ) );

                light = new THREE.DirectionalLight( 0xffffff );
                light.position.set( 1, 1, 1 );
                scene.add( light );

                // postprocessing

                composer = new THREE.EffectComposer( renderer );
                composer.addPass( new THREE.RenderPass( scene, camera ) );

                var effect = new THREE.ShaderPass( THREE.DMDShader );
                effect.uniforms[ 'colorDepth' ].value = 8;
                effect.uniforms[ 'size' ].value = new THREE.Vector2( cols, cols/aspect );
                // effect.renderToScreen = true;
                composer.addPass( effect );

                effectBloom = new THREE.BloomPass(5, 25, 5);
                // effectBloom.renderToScreen = true;
                composer.addPass(effectBloom);

                var copyPass = new THREE.ShaderPass( THREE.CopyShader );
                copyPass.renderToScreen = true;
                composer.addPass( copyPass );   


                scores.forEach(function(score){
                     addScore(score);
                });
                console.log(scoresObjectPositionY);
                scoresObject.position.y = scoresObjectPositionY;

                scores.observe({
                    addedAt: function(score, index, before){

                        console.log(score);
                        console.log(index);
                        console.log(before);

                        // if (score.score && index === 0 && before !== null) {
                            var currentDate = new Date(new Date() - 10000 );
                            addScore(score);
                            console.log("Added score");
                            if (score.date < currentDate){
                                scoresObject.position.y = scoresObjectPositionY;
                            }
                            // updateHighScores(score)
                        // }
                    },
                    removed: function(score){

                        scoresObject.remove(scoresObject.getObjectByName(score._id+"name"));
                        scoresObject.remove(scoresObject.getObjectByName(score._id+"score"));
                    }
                });

                highScores.observe({
                    addedAt: function(highscore, index, before){
                        // updateHighScore(highscore);
                    },
                    removed: function(highscore){
                        scene.remove(scene.getObjectByName(highscore._id+"name"));
                        scene.remove(scene.getObjectByName(highscore._id+"score"));

                    }
                });
                
                window.addEventListener( 'resize', onWindowResize, false );

            }

            function onWindowResize() {

                camera.aspect = window.innerWidth / window.innerHeight;
                camera.updateProjectionMatrix();

                renderer.setSize( window.innerWidth, window.innerHeight );

            }

            function animate() {

                requestAnimationFrame( animate );

                // scoresObject.rotation.x += 0.005;
                // scoresObject.rotation.y += 0.03;
                
                if (scoresObjectPositionY < scoresObject.position.y) {
                    scoresObject.position.y -= 20;
                }
                

                composer.render(0.05);

            }

            function addScore(score){

                console.log("Rendering score");

                var y = -scoresRenderd * 200;

                var nameText = new THREE.TextGeometry(score.player, {size: 80, height: 20, curveSegments: 2, font: "helvetiker"});
                nameText.computeBoundingBox();
                nameText.computeVertexNormals();
                var centerOffsetNameText = -0.5 * ( nameText.boundingBox.max.x - nameText.boundingBox.min.x );
                var nameMesh = new THREE.Mesh( nameText, material );
                nameMesh.position.set( -730, -y, 0 );
                nameMesh.name = score._id+"name";
                scoresObject.add(nameMesh);

                 var scoreText = new THREE.TextGeometry(numeral(score.score).format('0,0'), {size: 100, height: 20, curveSegments: 2, font: "piston pressure"});
                scoreText.computeBoundingBox();
                scoreText.computeVertexNormals();
                var centerOffsetscoreText = -0.5 * ( scoreText.boundingBox.max.x - scoreText.boundingBox.min.x );
                var scoreMesh = new THREE.Mesh( scoreText, material );
                scoreMesh.position.set( centerOffsetscoreText + 200,-y,0 );
                scoreMesh.name = score._id+"score";
                scoresObject.add(scoreMesh);

                scoresRenderd += 1;
                scoresObjectPositionY = y;

            }

            function updateHighScore(score){

                var nameText = new THREE.TextGeometry(score.player, {size: 100, height: 20, curveSegments: 2, font: "helvetiker"});
                nameText.computeBoundingBox();
                nameText.computeVertexNormals();
                var centerOffsetNameText = -0.5 * ( nameText.boundingBox.max.x - nameText.boundingBox.min.x );
                var nameMesh = new THREE.Mesh( nameText, material );
                nameMesh.position.set( -790, 400, -1000 );
                nameMesh.name = score._id+"name";
                scene.add(nameMesh);

                var scoreText = new THREE.TextGeometry(numeral(score.score).format('0,0'), {size: 200, height: 20, curveSegments: 2, font: "piston pressure"});
                scoreText.computeBoundingBox();
                scoreText.computeVertexNormals();
                var centerOffsetscoreText = -0.5 * ( scoreText.boundingBox.max.x - scoreText.boundingBox.min.x );
                var scoreMesh = new THREE.Mesh( scoreText, material );
                scoreMesh.position.set( centerOffsetscoreText, 180,-1000 );
                scoreMesh.name = score._id+"score";
                scene.add(scoreMesh);
            }


            // Tracker.autorun(function(){

            //     console.log("AUToRUN");

            //     var scores = Scores.findOne({},{sort: {date: -1}});
                

            // });
};
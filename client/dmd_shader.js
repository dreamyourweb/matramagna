/**
 * @author alteredq / http://alteredqualia.com/
 */

/**
 * @author alteredq / http://alteredqualia.com/
 *
 * Dot screen shader
 * based on glfx.js sepia shader
 * https://github.com/evanw/glfx.js
 */

THREE.DMDShader = {

    uniforms: {

        "tDiffuse": { type: "t", value: null },
        "size":    { type: "v2", value: new THREE.Vector2( 192.0, 48.0 ) },
        "center":   { type: "v2", value: new THREE.Vector2( 0.5, 0.5 ) },
        "colorDepth": { type: "f", value: 8.0 }
    },

    vertexShader: [

        "varying vec2 vUv;",

        "void main() {",

            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

        "}"

    ].join("\n"),

    fragmentShader: [

        "uniform vec2 center;",
        "uniform float scale;",
        "uniform float colorDepth;",
        "uniform vec2 size;",

        "uniform sampler2D tDiffuse;",

        "varying vec2 vUv;",

        "void main() {",
            "vec2 c = vec2(floor(vUv[0]*size[0] + 0.5)/size[0], floor(vUv[1]*size[1] + 0.5)/size[1]);",
            "vec4 color = texture2D( tDiffuse, c );",

            "float average = floor((( color.r + color.g + color.b ) / 2.5) * colorDepth)/colorDepth + 1.0/colorDepth;",
            "vec4 red = vec4((1.0 - average)/5.0 + 1.0, 0.0, 0.0, 0.0);",
            "vec4 orange = vec4( 1.0, 0.4, 0.0, 0.0 );",
            "float pixelHard =  (sign(cos(vUv[0]*size[0]*2.0*3.1415)+0.6)+1.0)/2.0 * (sign(cos(vUv[1]*size[1]*2.0*3.1415)+0.6)+1.0)/2.0;",
            "float pixelSoft =  ((cos(vUv[0]*size[0]*2.0*3.1415)+0.6)+1.0)/2.0 * ((cos(vUv[1]*size[1]*2.0*3.1415)+0.6)+1.0)/2.0;",
            "float r = red[0] * average * orange[0] * pixelHard * pixelSoft;",
            "float g = average * orange[1] * pixelHard * pixelSoft;",
            "float b = average * orange[2] * pixelHard * pixelSoft;",


            "gl_FragColor = vec4( r, g, b, 1 );",

        "}"

    ].join("\n")

};




THREE.DMDPass = function ( center, angle, scale ) {

    if ( THREE.DMDShader === undefined )
        console.error( "THREE.DMDPass relies on THREE.DMDShader" );

    var shader = THREE.DMDShader;

    this.uniforms = THREE.UniformsUtils.clone( shader.uniforms );

    if ( center !== undefined ) this.uniforms[ "center" ].value.copy( center );
    if ( angle !== undefined ) this.uniforms[ "angle"].value = angle;
    if ( scale !== undefined ) this.uniforms[ "scale"].value = scale;

    this.material = new THREE.ShaderMaterial( {

        uniforms: this.uniforms,
        vertexShader: shader.vertexShader,
        fragmentShader: shader.fragmentShader

    } );

    this.enabled = true;
    this.renderToScreen = false;
    this.needsSwap = true;


    this.camera = new THREE.OrthographicCamera( -1, 1, 1, -1, 0, 1 );
    this.scene  = new THREE.Scene();

    this.quad = new THREE.Mesh( new THREE.PlaneBufferGeometry( 2, 2 ), null );
    this.scene.add( this.quad );

};

THREE.DMDPass.prototype = {

    render: function ( renderer, writeBuffer, readBuffer, delta ) {

        this.uniforms[ "tDiffuse" ].value = readBuffer;
        this.uniforms[ "tSize" ].value.set( readBuffer.width, readBuffer.height );

        this.quad.material = this.material;

        if ( this.renderToScreen ) {

            renderer.render( this.scene, this.camera );

        } else {

            renderer.render( this.scene, this.camera, writeBuffer, false );

        }

    }

};


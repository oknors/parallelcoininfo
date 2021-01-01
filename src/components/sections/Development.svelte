<script lang="js">
  import Slide from '../../../../components/element/Slide.svelte'
  export let page;

</script>

<Slide idTag="development"
       styleClass="step slide"
       dataX="480"
       dataY="-80"
       dataScale="0.05"
       dataAuto="10"
       slideTitle={page["Title"]}
>

  <section id="timeline">

    <div class="timeline flex justify-center items-center">
      <article class="w-full mb-6 px-4">
        <h2>Education</h2>
        <figure>
          <figcaption>Lorem</figcaption>
          <h6>2011 - NOW</h6>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et ipsum pulvinar, blandit neque in, ornare libero. Ut ut libero in nibh convallis sollicitudin. Maecenas ante erat, lacinia commodo pretium vel, ultricies eget nibh. Duis et felis lectus. Donec orci libero, auctor eget sodales at, euismod venenatis nibh.
          </p>
        </figure>
        <figure>
          <figcaption>ipsum</figcaption>
          <h6>2013</h6>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et ipsum pulvinar, blandit neque in, ornare libero.
          </p>
        </figure>
        <figure>
          <figcaption>consectetur</figcaption>
          <h6>2007 - 2010</h6>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et ipsum pulvinar, blandit neque in, ornare libero.
          </p>
        </figure>
        <figure>
          <figcaption>sit amet</figcaption>
          <h6>2009</h6>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et ipsum pulvinar, blandit neque in, ornare libero.
          </p>
        </figure>
      </article>

      <article class="w-full mb-6 px-4">
        <h2>Work</h2>
        <figure>
          <figcaption>ornare</figcaption>
          <h6>2012 - 06.2013</h6>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et ipsum pulvinar, blandit neque in, ornare libero.
        </figure>
        <figure>
          <figcaption>libero</figcaption>
          <h6>2010 - 2011</h6>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et ipsum pulvinar, blandit neque in, ornare libero.
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et ipsum pulvinar, blandit neque in, ornare libero.
          </p>
        </figure>
        <figure>
          <figcaption>adipiscing</figcaption>
          <h6>2010</h6>
          <p>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nam et ipsum pulvinar, blandit neque in, ornare libero.
          </p>
        </figure>
      </article>
      <br style="clear:both" />
    </div>

  </section>

</Slide>


<style>
  #timeline {
    padding-top: 5%;
  }
  .timeline {
    height: 100%;
    position: relative;
  }
  .timeline canvas {
    position: absolute;
    width: 100%;
    height: 100%;
    left: 0;
    top: 0;
  }
  .timeline figcaption {
    text-transform: uppercase;
  }
  .timeline h2 {
    padding-bottom: 100px;
    color: #b2cde9;
  }
  .timeline h6 {
    color: #0090F5;
    font: 400 80% Tahoma;
  }
  .timeline p,
  .timeline ol {
    padding: 3px 0 20px 0;
    color: #575757;
    text-align: justify;
  }
  .timeline ol {
    list-style: disc;
    margin-top: -20px;
    padding-left: 40px;
  }
  .timeline figure {
    float: right;
    width: 100%;
  }
  .timeline article {
    position: relative;
    overflow: hidden;
    margin-bottom: 100px;
  }
  .timeline article:first-of-type {
    float: left;
    text-align: right;
  }
  .timeline article:first-of-type p,
  .timeline article:first-of-type figure {
    float: right;
  }
  .timeline article:last-of-type {
    float: right;
  }
  .timeline article:last-of-type h2 {
    color: #c6e0aa;
  }
  .timeline article:last-of-type h6,
  .timeline article:last-of-type a {
    color: #40aa00;
  }
  .timeline article:last-of-type a:hover {
    color: #95D40D;
  }
</style>

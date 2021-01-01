<script lang="js">
    import { onMount } from 'svelte';
	onMount(async () => {
		await import('video.js');
	});
</script>


<video
  muted
  id="grunge"
  controls
  preload
  poster="black-square.jpg"
  autoplay
  loop
>
  <source src="http://s.okno.rs:4433/video/grunge.mp4" type="video/mp4" />
  <!-- <source src="http://s.okno.rs:4433/video/grunge.webm" type="video/webm" /> -->
  <p class="vjs-no-js">
    To view this video please enable JavaScript, and consider upgrading to a
    web browser that
    <a href="https://videojs.com/html5-video-support/" target="_blank">supports HTML5 video</a>
  </p>
</video>

<style>
     #grunge {
       object-fit: cover;
       width: 100vw;
       height: 100vh;
       position: fixed;
       top: 0;
       left: 0;
      transform: scale(1.1);
       pointer-events: none;
       opacity: 0.111;
    }
</style>

<script context="module">
  export function preload({ params, query }) {
    return this.fetch(`http://api.okno.rs:4433/data/parallelcoin_info/pages`).then(r => r.json()).then(pages => {
      return { pages };
    });
  }
</script>

<script>
  export let pages;

  import Tailwind from '../components/Tailwind.svelte';
  import Impress from '../components/Impress.svelte';
  import Video from '../components/Video.svelte';

  import Sections from '../components/Sections.svelte';

</script>

<svelte:head>
	<title>Let's go Parallel</title>
</svelte:head>

<Video />
<Tailwind />
<Impress />

<div id="impress"
    data-transition-duration="1000"
    data-width="1200"
    data-height="900"
    data-max-scale="3"
    data-min-scale="0"
    data-perspective="0"
    data-media-autoplay="true"
    data-media-autostop="true"
><Sections
 pageIntro={pages["intro"]}
  pageWhat={pages["what"]}
  pageWhy={pages["why"]}
    pageVision={pages["vision"]}
    pageApps={pages["apps"]}
    pageDevelopment={pages["development"]}
    pageDownload={pages["download"]}
    pageDocumentation={pages["documentation"]}
    pageStory={pages["story"]}
    pageStatus={pages["status"]}
    pageTechnology={pages["technology"]}
   pageBorg={pages["borg"]}
   pageWhere={pages["where"]}
></Sections>
</div>

<style global>
.transparentText{
  opacity: 0.62;
}
</style>

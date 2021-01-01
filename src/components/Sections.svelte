<script>
  import Intro from '../components/Intro.svelte';
  import What from '../components/What.svelte';
  import Why from '../components/Why.svelte';
  import Borg from '../components/Borg.svelte';
  import Where from '../components/Where.svelte';
  import Vision from '../components/sections/Vision.svelte';
  import Apps from '../components/sections/Apps.svelte';
  import Development from '../components/sections/Development.svelte';
  import Download from '../components/sections/Download.svelte';
  import Documentation from '../components/sections/Documentation.svelte';
  import Story from '../components/sections/Story.svelte';
  import Status from '../components/sections/Status.svelte';
  import Technology from '../components/sections/Technology.svelte';
  import Divider from '../components/sections/Divider.svelte';
  export let pageIntro;
  export let pageWhat;
  export let pageWhy;
  export let pageVision;
  export let pageApps;
  export let pageDevelopment;
  export let pageDocumentation;
  export let pageStatus;
  export let pageStory;
  export let pageDownload;
  export let pageTechnology;
  export let pageBorg;
  export let pageWhere;

</script>


<Intro page={pageIntro} />
<What page={pageWhat} />
<Why page={pageWhy} />

<Vision page={pageVision} />
<Divider />
<Apps page={pageApps} />
<Divider />
<Story page={pageStory} />
<Divider />
<Development page={pageDevelopment} />
<Divider />

<Technology page={pageTechnology} />
<Divider />
<Download page={pageDownload} />
<Divider />
<Documentation page={pageDocumentation} />
<Divider />
<Status page={pageStatus} />

<Borg page={pageBorg} />
<Where page={pageWhere} />

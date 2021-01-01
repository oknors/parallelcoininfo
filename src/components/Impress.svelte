<script lang="js">
	import { onMount } from 'svelte';
	onMount(async () => {
		await import('impress.js');
		await import('impress.js/src/plugins/media/media');
		impress().init()
	});
</script>

<style global>
  @import '../assets/impress.css';
  :global(:root){
    --yellow-color: #cfcf30;
    --orange-color: #cf8030;
    --red-color: #CF3030;
    --purple-color: #803080;
    --blue-color: #3080cf;
    --liteblue-color: #80a8cf;
    --darkblue-color: #305880;
    --green-color: #80cf30;

    --lite-color: #cfcfcf;
    --litegray-color: #a894a8;
    --gray-color: #808080;
    --darkgray-color: #584458;
    --dark-color: #303030;
  }

  .bottomlayer-blue .bottomlayer,.toplayer-blue .toplayer{
    background:var(--blue-color);
    fill:var(--blue-color);
  }
  .bottomlayer-liteblue .bottomlayer,.toplayer-liteblue .toplayer{
    background:var(--liteblue-color);
    fill:var(--liteblue-color);
  }
  .bottomlayer-darkblue .bottomlayer,.toplayer-darkblue .toplayer{
    background:var(--darkblue-color);
    fill:var(--darkblue-color);
  }
  .bottomlayer-dark .bottomlayer,.bottomlayer-dark .toplayer{
    background:var(--dark-color);
    fill:var(--dark-color);
  }
  .bottomlayer-green .bottomlayer,.toplayer-green .toplayer{
    background:var(--green-color);
    fill:var(--green-color);
  }
  .bottomlayer-orange .bottomlayer,.toplayer-orange .toplayer{
    background:var(--orange-color);
    fill:var(--orange-color);
  }
  .bottomlayer-yellow .bottomlayer,.toplayer-yellow .toplayer{
    background:var(--yellow-color);
    fill:var(--yellow-color);
  }
  .bottomlayer-red .bottomlayer,.toplayer-red .toplayer{
    background:var(--red-color);
    fill:var(--red-color);
  }
  .bottomlayer-purple .bottomlayer,.toplayer-purple .toplayer{
    background:var(--purple-color);
    fill:var(--purple-color);
  }
  .bottomlayer-darkgray .bottomlayer,.toplayer-darkgray .toplayer{
    background:var(--darkgray-color);
    fill:var(--darkgray-color);
  }
  .bottomlayer-gray .bottomlayer,.toplayer-gray .toplayer{
    background:var(--gray-color);
    fill:var(--gray-color);
  }
  .bottomlayer-lite .bottomlayer,.toplayer-lite .toplayer{
    background:var(--lite-color);
    fill:var(--lite-color);
  }
</style>

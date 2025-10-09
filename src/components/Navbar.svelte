<script>
    import ContextMenu, { Item, Divider, Settings } from "svelte-contextmenu";
    import { push, pop } from "svelte-spa-router";
    
    let userMenu;

    export let logout;
    export let sidebar = false;

    let query;

    function handleKeydown(event) {
        if (event.key === 'Enter') {
            push("/search/" + query);
        }
  }
</script>


<nav class="relative top-0 left-0 w-full p-2 grid grid-cols-3 items-center">
    <div class="col-start-1">
        <span class="md:hidden">
            <i class="fa-solid fa-bars" on:click={() => sidebar = !sidebar}></i>
        </span>
        <span class="hidden md:block"><i class="fa-solid fa-less-than col-start-1 cursor-pointer" on:click={pop}></i></span>
    </div>
    <div class="flex justify-self-center col-start-2 gap-2 items-center">
    <i on:click={() => {push("/")}} class="fa-solid fa-house cursor-pointer" ></i>
    <input bind:value={query} type="text" placeholder="Search for music..." on:keyup={handleKeydown} class="focus:border-violet-900 border-b-2 border-transparent hover:border-violet-900 ease-in-out transition-all duration-200" />
        <button on:click={() => {push("/search/"+query)}} class="cursor-pointer">
            <i class="fa-solid fa-magnifying-glass"></i>
        </button>
    </div>

    <div class="justify-self-end col-start-3" >
        <button class="cursor-pointer" on:click={userMenu.createHandler()} ><i class="fa-regular fa-user"></i></button>
    </div>
</nav>

<ContextMenu bind:this={userMenu} >
    <i class="fa-solid fa-xmark"></i>
    <Divider />
    <Item on:click={logout()} >Log out</Item>
</ContextMenu>
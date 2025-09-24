<script>
    export let token, updateVolume;
    let username = "", password = "";
    import { Login, Register } from '../App.js';
    import { toast } from 'svelte-french-toast';

    let register = false;
</script>

{#if register}
    <div class="items-center justify-center ml-auto mr-auto min-h-screen flex">
    <div class="w-2/6 flex flex-col gap-3 border-2 border-violet-950 shadow-md shadow-violet-950 rounded-lg p-4 text-center">
      <h2>Register to YAMS</h2>
      <input type="text" bind:value={username} placeholder="Username" required />
      <input type="password" bind:value={password} placeholder="Password" required />
      <button on:click={() => { register = false; username = ""; password = ""; }} class="cursor-pointer text-xs text-violet-950" >Login</button>
      <button class="cursor-pointer" on:click={async () => {
        toast.promise(
            Register(username, password),
          {
            loading: 'Loading...',
            success: (data) => {
              localStorage.setItem('token', data);
              token = data;
              updateVolume();
              username = "";
              password = "";
              return 'Register successful!';
            },
            error: 'Register failed.',
          }
        );
      }}>Register</button>
    </div>
  </div>
{:else}
<div class="items-center justify-center ml-auto mr-auto min-h-screen flex">
    <div class="w-2/6 flex flex-col gap-3 border-2 border-violet-950 shadow-md shadow-violet-950 rounded-lg p-4 text-center">
      <h2>Login to YAMS</h2>
      <input type="text" bind:value={username} placeholder="Username" required />
      <input type="password" bind:value={password} placeholder="Password" required />
      <button on:click={() => { register = true; username = ""; password = ""; }} class="cursor-pointer text-xs text-violet-950">Register</button>
      <button class="cursor-pointer" on:click={async () => {
        toast.promise(
            Login(username, password),
          {
            loading: 'Loading...',
            success: (data) => {
              localStorage.setItem('token', data);
              token = data;
              updateVolume();
              username = "";
              password = "";
              return 'Login successful!';
            },
            error: 'Login failed.' ,
          }
        );
      }}>Login</button>
    </div>
  </div>
{/if}
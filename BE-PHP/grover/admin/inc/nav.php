    <?php // if ($perms->superuser()): ?>
        
        <div class="nav-collapse sidebar-nav collapse navbar-collapse bs-navbar-collapse">
            <?php echo $admin->do_list_bootstrap($config['admin']['moduli_menu']); ?>
        </div>
    <?php // endif ?>
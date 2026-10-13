<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Role extends Model
{
    protected $table = 'roles';

    protected $primaryKey = 'id_role';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'nama_role',
        'deskripsi',
    ];

    public function users(): HasMany
    {
        return $this->hasMany(
            User::class,
            'id_role',
            'id_role'
        );
    }
}
?>
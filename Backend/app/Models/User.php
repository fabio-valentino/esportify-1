<?php

namespace App\Models;

use App\Models\Player;
use App\Models\Admin;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Laravel\Sanctum\HasApiTokens;
use Spatie\Permission\Traits\HasRoles;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory, Notifiable, HasRoles;

    protected $table = 'users';

    protected $primaryKey = 'id_user';

    public $incrementing = true;

    protected $keyType = 'int';

    protected $fillable = [
        'username',
        'email',
        'password',
        'status',
        'terakhir_login',
    ];

    protected $hidden = [
        'password',
    ];

    protected function casts(): array
    {
        return [
            'password' => 'hashed',
            'terakhir_login' => 'datetime',
        ];
    }

    /**
     * Relasi ke profil Player.
     */
    public function player(): HasOne
    {
        return $this->hasOne(
            Player::class,
            'id_user',
            'id_user'
        );
    }

    /**
     * Relasi ke profil Admin.
     */
    public function admin(): HasOne
    {
        return $this->hasOne(
            Admin::class,
            'id_user',
            'id_user'
        );
    }
}
?>
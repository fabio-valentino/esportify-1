<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Game extends Model
{
    protected $table = 'games';

    protected $primaryKey = 'id_game';

    protected $fillable = [
        'id_admin',
        'avatar',
        'nama_game',
    ];

    public function admin(): BelongsTo
    {
        return $this->belongsTo(Admin::class, 'id_admin', 'id_admin');
    }

    public function kategoris(): BelongsToMany
    {
        return $this->belongsToMany(
            Kategori::class,
            'kategori_game',
            'id_game',
            'id_kategori',
            'id_game',
            'id_kategori'
        );
    }
}
?>